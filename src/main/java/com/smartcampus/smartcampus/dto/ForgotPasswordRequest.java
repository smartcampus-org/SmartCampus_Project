package com.smartcampus.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * SC-88 — Demande de réinitialisation de mot de passe
 * SC-101 — Ne révèle pas si l'e-mail existe
 */
public record ForgotPasswordRequest(

        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(message = "L'e-mail est invalide")
        String email

) {}
