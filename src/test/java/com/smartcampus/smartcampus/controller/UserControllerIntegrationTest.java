package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.entity.Role;
import com.smartcampus.smartcampus.repository.RoleRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * SC-97 — Tests d'intégration : inscription, profil, réinitialisation de mot de passe.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("UserController — Tests d'intégration")
class UserControllerIntegrationTest {

    @Autowired private MockMvc       mockMvc;
    @Autowired private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {
        ensureRole("ETUDIANT");
        ensureRole("ADMIN");
        ensureRole("PERSONNEL");
    }

    private void ensureRole(String name) {
        roleRepository.findByName(name).orElseGet(() -> {
            Role r = new Role();
            r.setName(name);
            return roleRepository.save(r);
        });
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/register
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-86 : inscription valide → 201 + profil retourné")
    void register_validRequest_returns201() throws Exception {
        String body = """
                {"firstName":"Youssef","lastName":"Alami",
                 "email":"youssef.alami@smartcampus.ma",
                 "password":"Secure@123","role":"ETUDIANT"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("youssef.alami@smartcampus.ma"))
                .andExpect(jsonPath("$.role").value("ETUDIANT"));
    }

    @Test
    @DisplayName("SC-86 : e-mail non institutionnel → 400")
    void register_nonInstitutionalEmail_returns400() throws Exception {
        String body = """
                {"firstName":"Test","lastName":"User",
                 "email":"test@gmail.com",
                 "password":"Secure@123","role":"ETUDIANT"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SC-86 : mot de passe faible → 400")
    void register_weakPassword_returns400() throws Exception {
        String body = """
                {"firstName":"Test","lastName":"User",
                 "email":"test2@smartcampus.ma",
                 "password":"password","role":"ETUDIANT"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SC-86 : e-mail déjà utilisé → 409 Conflict")
    void register_duplicateEmail_returns409() throws Exception {
        String body = """
                {"firstName":"A","lastName":"B",
                 "email":"dup@smartcampus.ma",
                 "password":"Secure@123","role":"ETUDIANT"}
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    // -------------------------------------------------------------------------
    // GET /api/user/profile  (nécessite un token)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-90 : profil sans token → 401/403")
    void profile_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("SC-90 : profil avec token valide → 200 + données utilisateur")
    void profile_withValidToken_returns200() throws Exception {
        String reg = """
                {"firstName":"Profil","lastName":"Test",
                 "email":"profil@smartcampus.ma",
                 "password":"Secure@123","role":"ETUDIANT"}
                """;
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(reg));

        String loginResp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"profil@smartcampus.ma","password":"Secure@123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = loginResp.replaceAll(".*\"accessToken\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profil@smartcampus.ma"));
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/forgot-password
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-88 + SC-101 : forgot-password → 200 avec message générique")
    void forgotPassword_alwaysReturns200() throws Exception {
        String body = """
                {"email":"inconnu@smartcampus.ma"}
                """;

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "Si cet e-mail est associé à un compte, un lien de réinitialisation a été envoyé."));
    }

    // -------------------------------------------------------------------------
    // SC-87 — Accès selon le rôle
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("SC-87 : route admin sans token → 401/403")
    void adminRoute_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/test"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("SC-87 : route admin avec token ETUDIANT → 403")
    void adminRoute_withEtudiantToken_returns403() throws Exception {
        String reg = """
                {"firstName":"Stud","lastName":"Role",
                 "email":"studrole@smartcampus.ma",
                 "password":"Secure@123","role":"ETUDIANT"}
                """;
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(reg));

        String loginResp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"studrole@smartcampus.ma","password":"Secure@123"}
                                """))
                .andReturn().getResponse().getContentAsString();

        String token = loginResp.replaceAll(".*\"accessToken\":\"([^\"]+)\".*", "$1");

        mockMvc.perform(get("/api/admin/test")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}
