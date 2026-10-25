package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.entity.Role;
import com.smartcampus.smartcampus.entity.User;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

/**
 * SC-96 — Tests unitaires du JwtService.
 */
@DisplayName("JwtService — Tests unitaires")
class JwtServiceTest {

    private JwtService jwtService;

    // Clé Base64 de 32+ caractères pour les tests
    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTMyY2hhcnMh";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", 3600000L);
    }

    private User buildUser(String email, String role) {
        Role r = new Role();
        r.setId(1L);
        r.setName(role);

        User user = new User();
        user.setId(42L);
        user.setEmail(email);
        user.setRole(r);
        return user;
    }

    @Test
    @DisplayName("SC-92 : generateToken retourne un token non vide")
    void generateToken_returnsNonBlankToken() {
        User user = buildUser("etudiant@smartcampus.ma", "ETUDIANT");
        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("SC-92 : extractEmail retourne l'e-mail encodé dans le token")
    void extractEmail_returnsCorrectEmail() {
        User user = buildUser("etudiant@smartcampus.ma", "ETUDIANT");
        String token = jwtService.generateToken(user);
        assertThat(jwtService.extractEmail(token)).isEqualTo("etudiant@smartcampus.ma");
    }

    @Test
    @DisplayName("SC-92 : isTokenValid → true pour un token frais")
    void isTokenValid_freshToken_returnsTrue() {
        User user = buildUser("admin@smartcampus.ma", "ADMIN");
        String token = jwtService.generateToken(user);
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("SC-92 : isTokenValid → false pour un token expiré")
    void isTokenValid_expiredToken_returnsFalse() {
        // Créer un service avec expiration = 0 ms (immédiatement expiré)
        JwtService expiredService = new JwtService();
        ReflectionTestUtils.setField(expiredService, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(expiredService, "expiration", 0L);

        User user = buildUser("test@smartcampus.ma", "ETUDIANT");
        String token = expiredService.generateToken(user);

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("SC-92 : isTokenValid → false pour un token falsifié")
    void isTokenValid_tamperedToken_returnsFalse() {
        assertThat(jwtService.isTokenValid("not.a.valid.token")).isFalse();
    }

    @Test
    @DisplayName("SC-92 : le token contient le rôle dans les claims")
    void generateToken_containsRoleClaim() {
        User user = buildUser("admin@smartcampus.ma", "ADMIN");
        String token = jwtService.generateToken(user);
        String role = jwtService.extractClaims(token).get("role", String.class);
        assertThat(role).isEqualTo("ADMIN");
    }
}
