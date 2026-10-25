package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.entity.Role;
import com.smartcampus.smartcampus.entity.User;
import com.smartcampus.smartcampus.repository.RoleRepository;
import com.smartcampus.smartcampus.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * SC-97 — Tests d'intégration de l'API d'authentification.
 * Utilise H2 en mémoire (profil "test").
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController — Tests d'intégration")
class AuthControllerIntegrationTest {

    @Autowired private MockMvc       mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private static final String EMAIL    = "integ@smartcampus.ma";
    private static final String PASSWORD = "Test@12345";

    @BeforeEach
    void setUp() {
        Role role = roleRepository.findByName("ETUDIANT").orElseGet(() -> {
            Role r = new Role();
            r.setName("ETUDIANT");
            return roleRepository.save(r);
        });

        if (userRepository.findByEmail(EMAIL).isEmpty()) {
            User user = new User();
            user.setFirstName("Integ");
            user.setLastName("Test");
            user.setEmail(EMAIL);
            user.setPassword(passwordEncoder.encode(PASSWORD));
            user.setRole(role);
            user.setEnabled(true);
            user.setLocked(false);
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/login
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-8 : login valide → 200 + token JWT")
    void login_validCredentials_returns200WithToken() throws Exception {
        String body = """
                {"email":"%s","password":"%s"}
                """.formatted(EMAIL, PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.role").value("ETUDIANT"));
    }

    @Test
    @DisplayName("SC-8 : mauvais mot de passe → 401")
    void login_wrongPassword_returns401() throws Exception {
        String body = """
                {"email":"%s","password":"WrongPass@1"}
                """.formatted(EMAIL);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
    }

    @Test
    @DisplayName("SC-101 : e-mail inexistant → 401 avec message générique")
    void login_unknownEmail_returns401WithGenericMessage() throws Exception {
        String body = """
                {"email":"ghost@smartcampus.ma","password":"Pass@12345"}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
    }

    @Test
    @DisplayName("SC-93 : champ email manquant → 400 Bad Request")
    void login_missingEmail_returns400() throws Exception {
        String body = """
                {"password":"Test@12345"}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SC-93 : email invalide → 400 Bad Request")
    void login_invalidEmailFormat_returns400() throws Exception {
        String body = """
                {"email":"not-an-email","password":"Test@12345"}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SC-13 : 3 échecs → compte verrouillé → 401 AccountLocked")
    void login_threeFailures_locksAccount() throws Exception {
        String badBody = """
                {"email":"%s","password":"Wrong@1"}
                """.formatted(EMAIL);

        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(badBody))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("verrouillé")));
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/logout
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-9 : logout → 200 avec message")
    void logout_returns200() throws Exception {
        String loginBody = """
                {"email":"%s","password":"%s"}
                """.formatted(EMAIL, PASSWORD);

        String responseJson = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Extraire le token (simple substring, pas besoin d'ObjectMapper)
        String token = responseJson
                .replaceAll(".*\"accessToken\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Déconnexion réussie"));
    }
}
