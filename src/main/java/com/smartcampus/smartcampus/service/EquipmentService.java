package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.EquipmentRequest;
import com.smartcampus.smartcampus.dto.EquipmentResponse;
import com.smartcampus.smartcampus.entity.Equipment;
import com.smartcampus.smartcampus.entity.Room;
import com.smartcampus.smartcampus.exception.EquipmentNotFoundException;
import com.smartcampus.smartcampus.repository.EquipmentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * BACKEND 4 — Gestion des équipements des salles.
 */
@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final RoomService         roomService;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            RoomService roomService
    ) {
        this.equipmentRepository = equipmentRepository;
        this.roomService         = roomService;
    }

    // -------------------------------------------------------------------------
    // Consultation
    // -------------------------------------------------------------------------

    public List<EquipmentResponse> findByRoom(Long roomId) {
        roomService.getOrThrow(roomId); // vérifie que la salle existe
        return equipmentRepository.findByRoomId(roomId)
                .stream()
                .map(e -> toResponse(e, roomId))
                .toList();
    }

    public EquipmentResponse findById(Long roomId, Long equipmentId) {
        Equipment equipment = getOrThrow(equipmentId);
        verifyBelongsToRoom(equipment, roomId);
        return toResponse(equipment, roomId);
    }

    // -------------------------------------------------------------------------
    // Création
    // -------------------------------------------------------------------------

    @Transactional
    public EquipmentResponse create(Long roomId, EquipmentRequest request) {
        Room room = roomService.getOrThrow(roomId);
        Equipment equipment = new Equipment();
        apply(equipment, request, room);
        return toResponse(equipmentRepository.save(equipment), roomId);
    }

    // -------------------------------------------------------------------------
    // Modification
    // -------------------------------------------------------------------------

    @Transactional
    public EquipmentResponse update(Long roomId, Long equipmentId, EquipmentRequest request) {
        Equipment equipment = getOrThrow(equipmentId);
        verifyBelongsToRoom(equipment, roomId);
        apply(equipment, request, equipment.getRoom());
        return toResponse(equipmentRepository.save(equipment), roomId);
    }

    // -------------------------------------------------------------------------
    // Suppression
    // -------------------------------------------------------------------------

    @Transactional
    public void delete(Long roomId, Long equipmentId) {
        Equipment equipment = getOrThrow(equipmentId);
        verifyBelongsToRoom(equipment, roomId);
        equipmentRepository.deleteById(equipmentId);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    Equipment getOrThrow(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new EquipmentNotFoundException(id));
    }

    private void verifyBelongsToRoom(Equipment equipment, Long roomId) {
        if (!equipment.getRoom().getId().equals(roomId)) {
            throw new EquipmentNotFoundException(equipment.getId());
        }
    }

    private void apply(Equipment e, EquipmentRequest req, Room room) {
        e.setName(req.name());
        e.setType(req.type());
        e.setQuantity(req.quantity());
        e.setFunctional(req.functional());
        e.setNotes(req.notes());
        e.setRoom(room);
    }

    EquipmentResponse toResponse(Equipment e, Long roomId) {
        return new EquipmentResponse(
                e.getId(),
                e.getName(),
                e.getType(),
                e.getQuantity(),
                e.isFunctional(),
                e.getNotes(),
                roomId
        );
    }
}
