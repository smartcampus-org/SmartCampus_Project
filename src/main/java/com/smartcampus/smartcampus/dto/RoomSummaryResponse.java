package com.smartcampus.smartcampus.dto;

import com.smartcampus.smartcampus.entity.RoomStatus;
import com.smartcampus.smartcampus.entity.RoomType;

import java.time.LocalDateTime;

/**
 * BACKEND 2 — Réponse résumée d'une salle (liste / recherche).
 */
public record RoomSummaryResponse(
        Long          id,
        String        roomNumber,
        String        name,
        String        buildingName,
        Long          buildingId,
        int           floor,
        int           capacity,
        RoomType      type,
        RoomStatus    status,
        int           equipmentCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
