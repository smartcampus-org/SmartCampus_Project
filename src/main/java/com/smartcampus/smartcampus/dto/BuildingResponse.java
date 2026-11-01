package com.smartcampus.smartcampus.dto;

/**
 * BACKEND 2 — Réponse retournée pour un bâtiment.
 */
public record BuildingResponse(
        Long   id,
        String name,
        String address,
        int    floors,
        int    roomCount
) {}
