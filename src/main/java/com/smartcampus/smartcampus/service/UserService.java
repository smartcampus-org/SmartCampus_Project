package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.*;
import com.smartcampus.smartcampus.entity.AuditLog;
import com.smartcampus.smartcampus.entity.PasswordResetToken;
import com.smartcampus.smartcampus.entity.Role;
import com.smartcampus.smartcampus.entity.User;
import com.smartcampus.smartcampus.exception.*;
import com.smartcampus.smartcampus.repository.PasswordResetTokenRepository;
import com.smartcampus.smartcampus.repository.RoleRepository;
import com.smartcampus.smartcampus.repository.UserRepository;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * SC-86  — Inscription avec e-mail institutionnel
 * SC-87  — Accès selon le rôle
 * SC-88  — Réinitialisation de mot de passe
 * SC-90  — Profil & changement de mot de passe
 * SC-95  — Envoi d'e-mails
 * SC-13  — Verrouillage après 3 échecs
 * SC-101 — Message générique
 * SC-94  — Journal d'audit
 */
@Service
public class UserService {

    private static final int    MAX_FAILED_ATTEMPTS          = 3;
    private static final long   RESET_TOKEN_VALIDITY_MINUTES = 15;

    private final UserRepository              userRepository;
    private final RoleRepository              roleRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder             passwordEncoder;
    private final EmailService                emailService;
    private final AuditService                auditService;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Lazy AuditService auditService
    ) {
        this.userRepository  = userRepository;
        this.roleRepository  = roleRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService    = emailService;
        this.auditService    = auditService;
    }

    // -------------------------------------------------------------------------
    // SC-86 — Inscription
    // -------------------------------------------------------------------------
    @Transactional
    public UserProfileResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException();
        }

        String roleName = request.role().toUpperCase();
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RoleNotFoundException(roleName));

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setEnabled(true);
        user.setLocked(false);
        user.setFailedLoginAttempts(0);

        userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

        auditService.log(AuditLog.REGISTER, user.getEmail(),
                "Nouveau compte créé avec le rôle " + roleName, AuditLog.SUCCESS);

        return toProfileResponse(user);
    }

    // -------------------------------------------------------------------------
    // SC-13 — Gestion des échecs de connexion
    // -------------------------------------------------------------------------
    @Transactional
    public void handleFailedLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLocked(true);
                auditService.log(AuditLog.ACCOUNT_LOCKED, email,
                        "Compte verrouillé après " + attempts + " échecs", AuditLog.FAILURE);
            }
            userRepository.save(user);
        });
    }

    @Transactional
    public void handleSuccessfulLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
            }
        });
    }

    // -------------------------------------------------------------------------
    // SC-88 — Réinitialisation du mot de passe
    // SC-101 — Ne révèle jamais si l'e-mail existe
    // -------------------------------------------------------------------------
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            tokenRepository.deleteByUser(user);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALIDITY_MINUTES));
            resetToken.setUsed(false);
            tokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());

            auditService.log(AuditLog.PASSWORD_RESET_REQUEST, user.getEmail(),
                    "Demande de réinitialisation de mot de passe", AuditLog.SUCCESS);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository
                .findByToken(request.token())
                .orElseThrow(InvalidOrExpiredTokenException::new);

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new InvalidOrExpiredTokenException();
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setLocked(false);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        auditService.log(AuditLog.PASSWORD_RESET_SUCCESS, user.getEmail(),
                "Mot de passe réinitialisé avec succès", AuditLog.SUCCESS);
    }

    // -------------------------------------------------------------------------
    // SC-90 — Profil & changement de mot de passe
    // -------------------------------------------------------------------------
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
        return toProfileResponse(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        auditService.log(AuditLog.PASSWORD_CHANGE, email,
                "Mot de passe modifié depuis le profil", AuditLog.SUCCESS);
    }

    // -------------------------------------------------------------------------
    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getName()
        );
    }
}
