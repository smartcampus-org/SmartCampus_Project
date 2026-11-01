package com.smartcampus.smartcampus.dto;

import jakarta.validation.constraints.*;

/**
 * BACKEND 4 — Payload de création / mise à jour d'un équipement.
 */
public record EquipmentRequest(

        @NotBlank(message = "Le nom de l'équipement est obligatoire")
        @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
        String name,

        @NotBlank(message = "Le type de l'équipement est obligatoire")
        @Size(max = 50, message = "Le type ne peut pas dépasser 50 caractères")
        String type,

        @Min(value = 1, message = "La quantité doit être d'au moins 1")
        int quantity,

        boolean functional,

        @Size(max = 300, message = "Les notes ne peuvent pas dépasser 300 caractères")
        String notes

) {}
