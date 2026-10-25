package com.smartcampus.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * SC-86 — Inscription avec e-mail institutionnel
 * L'e-mail doit appartenir au domaine @smartcampus.ma
 */
public record RegisterRequest(

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String lastName,

        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(message = "L'e-mail est invalide")
        @Pattern(
                regexp = "^[a-zA-Z0-9._%+\\-]+@smartcampus\\.ma$",
                message = "Seuls les e-mails institutionnels (@smartcampus.ma) sont acceptés"
        )
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
        )
        String password,

        @NotBlank(message = "Le rôle est obligatoire")
        String role

) {}
