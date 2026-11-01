package com.smartcampus.smartcampus.dto;

import com.smartcampus.smartcampus.entity.RoomStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * BACKEND 5 — Payload pour changer le statut d'une salle.
 */
public record StatusChangeRequest(

        @NotNull(message = "Le nouveau statut est obligatoire")
        RoomStatus newStatus,

        @Size(max = 300, message = "La raison ne peut pas dépasser 300 caractères")
        String reason

) {}
