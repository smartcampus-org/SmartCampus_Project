package com.smartcampus.smartcampus.dto;

import com.smartcampus.smartcampus.entity.RoomStatus;
import com.smartcampus.smartcampus.entity.RoomType;
import jakarta.validation.constraints.*;

/**
 * BACKEND 3 — Payload de création / mise à jour d'une salle.
 */
public record RoomRequest(

        @NotBlank(message = "Le numéro de la salle est obligatoire")
        @Size(max = 20, message = "Le numéro ne peut pas dépasser 20 caractères")
        String roomNumber,

        @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
        String name,

        @NotNull(message = "L'identifiant du bâtiment est obligatoire")
        Long buildingId,

        @Min(value = 0, message = "L'étage doit être positif ou nul")
        int floor,

        @Min(value = 1, message = "La capacité doit être d'au moins 1")
        @Max(value = 5000, message = "La capacité ne peut pas dépasser 5000")
        int capacity,

        @NotNull(message = "Le type de salle est obligatoire")
        RoomType type,

        RoomStatus status,

        @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
        String description

) {}
