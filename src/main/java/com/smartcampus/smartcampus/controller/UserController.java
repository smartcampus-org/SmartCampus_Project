package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.dto.*;
import com.smartcampus.smartcampus.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SC-86  POST /api/auth/register         — Inscription
 * SC-88  POST /api/auth/forgot-password  — Demande réinitialisation
 * SC-88  POST /api/auth/reset-password   — Réinitialisation avec token
 * SC-90  GET  /api/user/profile          — Consulter le profil
 * SC-90  PUT  /api/user/password         — Changer le mot de passe
 * SC-93  — Validation des entrées (@Valid)
 * SC-100 — Documentation OpenAPI/Swagger
 */
@RestController
@Tag(name = "Utilisateur", description = "Inscription, profil et gestion du mot de passe")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // SC-86 — Inscription
    @Operation(summary = "Créer un compte",
               description = "Inscription avec un e-mail institutionnel (@smartcampus.ma).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Compte créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "409", description = "E-mail déjà utilisé")
    })
    @PostMapping("/api/auth/register")
    public ResponseEntity<UserProfileResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    // SC-88 — Demande de réinitialisation
    @Operation(summary = "Mot de passe oublié",
               description = "Envoie un lien de réinitialisation si l'e-mail est connu (SC-101 : réponse identique dans tous les cas).")
    @ApiResponse(responseCode = "200", description = "Réponse toujours identique (SC-101)")
    @PostMapping("/api/auth/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request);
        return ResponseEntity.ok(Map.of("message",
                "Si cet e-mail est associé à un compte, un lien de réinitialisation a été envoyé."));
    }

    // SC-88 — Réinitialisation avec token
    @Operation(summary = "Réinitialiser le mot de passe",
               description = "Utilise le token reçu par e-mail pour définir un nouveau mot de passe.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé"),
            @ApiResponse(responseCode = "400", description = "Token invalide ou expiré")
    })
    @PostMapping("/api/auth/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès."));
    }

    // SC-90 — Consulter le profil
    @Operation(summary = "Mon profil", description = "Retourne le profil de l'utilisateur connecté.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profil retourné"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/user/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    // SC-90 — Changer le mot de passe
    @Operation(summary = "Changer le mot de passe",
               description = "Change le mot de passe après vérification de l'ancien.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Mot de passe mis à jour"),
            @ApiResponse(responseCode = "401", description = "Ancien mot de passe incorrect")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/api/user/password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès."));
    }
}
