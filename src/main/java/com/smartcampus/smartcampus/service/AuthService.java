package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.AuthResponse;
import com.smartcampus.smartcampus.dto.LoginRequest;
import com.smartcampus.smartcampus.entity.AuditLog;
import com.smartcampus.smartcampus.entity.User;
import com.smartcampus.smartcampus.exception.AccountLockedException;
import com.smartcampus.smartcampus.exception.InvalidCredentialsException;
import com.smartcampus.smartcampus.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;
    private final AuditService auditService;   // SC-94

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserService userService,
            AuditService auditService
    ) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService      = jwtService;
        this.userService     = userService;
        this.auditService    = auditService;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

        // SC-101 — message générique, ne révèle pas l'existence de l'e-mail
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    auditService.log(AuditLog.LOGIN_FAILURE, request.email(),
                            "E-mail inconnu", AuditLog.FAILURE);
                    return new InvalidCredentialsException();
                });

        // SC-13 — compte verrouillé
        if (user.isLocked()) {
            auditService.log(AuditLog.ACCOUNT_LOCKED, request.email(),
                    "Tentative de connexion sur un compte verrouillé", AuditLog.FAILURE);
            throw new AccountLockedException();
        }

        if (!user.isEnabled()) {
            auditService.log(AuditLog.LOGIN_FAILURE, request.email(),
                    "Compte désactivé", AuditLog.FAILURE);
            throw new InvalidCredentialsException();
        }

        // Vérification du mot de passe
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            userService.handleFailedLogin(request.email());
            auditService.log(AuditLog.LOGIN_FAILURE, request.email(),
                    "Mot de passe incorrect", AuditLog.FAILURE);
            throw new InvalidCredentialsException();
        }

        // Connexion réussie
        userService.handleSuccessfulLogin(request.email());
        String token = jwtService.generateToken(user);

        auditService.log(AuditLog.LOGIN_SUCCESS, request.email(),
                "Connexion réussie", AuditLog.SUCCESS);

        return new AuthResponse(token, "Bearer", user.getId(),
                user.getEmail(), user.getRole().getName());
    }
}
