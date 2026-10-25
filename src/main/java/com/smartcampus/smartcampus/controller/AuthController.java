package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.dto.AuthResponse;
import com.smartcampus.smartcampus.dto.LoginRequest;
import com.smartcampus.smartcampus.entity.AuditLog;
import com.smartcampus.smartcampus.service.AuditService;
import com.smartcampus.smartcampus.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SC-93 — Endpoints /api/auth/* avec validation des entrées
 * SC-94 — Journal d'audit (logout)
 * SC-100 — Documentation OpenAPI/Swagger
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "Connexion, déconnexion et gestion du compte")
public class AuthController {

    private final AuthService  authService;
    private final AuditService auditService;

    public AuthController(AuthService authService, AuditService auditService) {
        this.authService  = authService;
        this.auditService = auditService;
    }

    // SC-8 — Connexion
    @Operation(summary = "Connexion", description = "Authentifie un utilisateur et retourne un token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Connexion réussie"),
            @ApiResponse(responseCode = "401", description = "Identifiants incorrects ou compte verrouillé")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // SC-9 — Déconnexion
    @Operation(summary = "Déconnexion", description = "Invalide la session côté client (JWT stateless).")
    @ApiResponse(responseCode = "200", description = "Déconnexion réussie")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        auditService.log(AuditLog.LOGOUT, email, "Déconnexion", AuditLog.SUCCESS);
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
}
