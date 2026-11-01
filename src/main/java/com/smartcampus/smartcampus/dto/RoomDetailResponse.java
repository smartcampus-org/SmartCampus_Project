package com.smartcampus.smartcampus.dto;

import com.smartcampus.smartcampus.entity.RoomStatus;
import com.smartcampus.smartcampus.entity.RoomType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * BACKEND 2 — Réponse détaillée d'une salle (consultation par ID).
 * Inclut la liste des équipements.
 */
public record RoomDetailResponse(
        Long                     id,
        String                   roomNumber,
        String                   name,
        BuildingResponse         building,
        int                      floor,
        int                      capacity,
        RoomType                 type,
        RoomStatus               status,
        String                   description,
        List<EquipmentResponse>  equipments,
        LocalDateTime            createdAt,
        LocalDateTime            updatedAt
) {}
