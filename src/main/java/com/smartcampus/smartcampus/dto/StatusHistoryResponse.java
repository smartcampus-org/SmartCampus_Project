package com.smartcampus.smartcampus.dto;

import com.smartcampus.smartcampus.entity.RoomStatus;

import java.time.LocalDateTime;

/**
 * BACKEND 5 — Réponse d'une entrée de l'historique des statuts.
 */
public record StatusHistoryResponse(
        Long          id,
        Long          roomId,
        RoomStatus    oldStatus,
        RoomStatus    newStatus,
        String        changedBy,
        String        reason,
        LocalDateTime changedAt
) {}
