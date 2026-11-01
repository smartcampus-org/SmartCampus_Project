package com.smartcampus.smartcampus.dto;

/**
 * BACKEND 4 — Réponse représentant un équipement.
 */
public record EquipmentResponse(
        Long    id,
        String  name,
        String  type,
        int     quantity,
        boolean functional,
        String  notes,
        Long    roomId
) {}
