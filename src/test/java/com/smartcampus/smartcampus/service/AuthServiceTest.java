package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.AuthResponse;
import com.smartcampus.smartcampus.dto.LoginRequest;
import com.smartcampus.smartcampus.entity.Role;
import com.smartcampus.smartcampus.entity.User;
import com.smartcampus.smartcampus.exception.AccountLockedException;
import com.smartcampus.smartcampus.exception.InvalidCredentialsException;
import com.smartcampus.smartcampus.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * SC-96 — Tests unitaires du service d'authentification.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Tests unitaires")
class AuthServiceTest {

    @Mock private UserRepository  userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService      jwtService;
    @Mock private UserService     userService;
    @Mock private AuditService    auditService;

    @InjectMocks
    private AuthService authService;

    private User validUser;

    @BeforeEach
    void setUp() {
        Role role = new Role();
        role.setId(1L);
        role.setName("ETUDIANT");

        validUser = new User();
        validUser.setId(1L);
        validUser.setFirstName("Test");
        validUser.setLastName("User");
        validUser.setEmail("test@smartcampus.ma");
        validUser.setPassword("$2a$10$hashedPassword");
        validUser.setRole(role);
        validUser.setEnabled(true);
        validUser.setLocked(false);
        validUser.setFailedLoginAttempts(0);
    }

    // -------------------------------------------------------------------------
    // Connexion réussie
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-8 : connexion réussie → retourne AuthResponse avec token")
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest request = new LoginRequest("test@smartcampus.ma", "Password@1");

        when(userRepository.findByEmail("test@smartcampus.ma"))
                .thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches("Password@1", validUser.getPassword()))
                .thenReturn(true);
        when(jwtService.generateToken(validUser))
                .thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.email()).isEqualTo("test@smartcampus.ma");
        assertThat(response.role()).isEqualTo("ETUDIANT");
        assertThat(response.tokenType()).isEqualTo("Bearer");

        verify(userService).handleSuccessfulLogin("test@smartcampus.ma");
    }

    // -------------------------------------------------------------------------
    // E-mail inconnu
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-101 : e-mail inconnu → InvalidCredentialsException (message générique)")
    void login_emailNotFound_throwsInvalidCredentials() {
        LoginRequest request = new LoginRequest("unknown@smartcampus.ma", "Password@1");

        when(userRepository.findByEmail("unknown@smartcampus.ma"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Email ou mot de passe incorrect");
    }

    // -------------------------------------------------------------------------
    // Mauvais mot de passe
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-8 : mauvais mot de passe → InvalidCredentialsException")
    void login_wrongPassword_throwsInvalidCredentials() {
        LoginRequest request = new LoginRequest("test@smartcampus.ma", "WrongPass@1");

        when(userRepository.findByEmail("test@smartcampus.ma"))
                .thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches("WrongPass@1", validUser.getPassword()))
                .thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(userService).handleFailedLogin("test@smartcampus.ma");
    }

    // -------------------------------------------------------------------------
    // Compte verrouillé
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-13 : compte verrouillé → AccountLockedException")
    void login_lockedAccount_throwsAccountLocked() {
        validUser.setLocked(true);
        LoginRequest request = new LoginRequest("test@smartcampus.ma", "Password@1");

        when(userRepository.findByEmail("test@smartcampus.ma"))
                .thenReturn(Optional.of(validUser));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AccountLockedException.class);

        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    // -------------------------------------------------------------------------
    // Compte désactivé
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-87 : compte désactivé → InvalidCredentialsException")
    void login_disabledAccount_throwsInvalidCredentials() {
        validUser.setEnabled(false);
        LoginRequest request = new LoginRequest("test@smartcampus.ma", "Password@1");

        when(userRepository.findByEmail("test@smartcampus.ma"))
                .thenReturn(Optional.of(validUser));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    // -------------------------------------------------------------------------
    // Audit loggé
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-94 : connexion réussie → audit SUCCESS loggé")
    void login_success_auditLogged() {
        LoginRequest request = new LoginRequest("test@smartcampus.ma", "Password@1");

        when(userRepository.findByEmail("test@smartcampus.ma"))
                .thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateToken(validUser)).thenReturn("token");

        authService.login(request);

        verify(auditService).log(
                eq("LOGIN_SUCCESS"),
                eq("test@smartcampus.ma"),
                anyString(),
                eq("SUCCESS")
        );
    }

    @Test
    @DisplayName("SC-94 : échec de connexion → audit FAILURE loggé")
    void login_failure_auditLogged() {
        LoginRequest request = new LoginRequest("test@smartcampus.ma", "Wrong@1");

        when(userRepository.findByEmail("test@smartcampus.ma"))
                .thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(auditService).log(
                eq("LOGIN_FAILURE"),
                eq("test@smartcampus.ma"),
                anyString(),
                eq("FAILURE")
        );
    }
}
