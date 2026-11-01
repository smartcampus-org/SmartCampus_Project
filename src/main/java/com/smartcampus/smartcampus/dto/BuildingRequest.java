package com.smartcampus.smartcampus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * BACKEND 3 — Payload de création / mise à jour d'un bâtiment.
 */
public record BuildingRequest(

        @NotBlank(message = "Le nom du bâtiment est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
        String name,

        @Size(max = 255, message = "L'adresse ne peut pas dépasser 255 caractères")
        String address,

        @Min(value = 0, message = "Le nombre d'étages doit être positif ou nul")
        int floors

) {}
