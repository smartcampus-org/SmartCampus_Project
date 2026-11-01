package com.smartcampus.smartcampus.repository;

import com.smartcampus.smartcampus.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * BACKEND 4 — Accès aux équipements des salles.
 */
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByRoomId(Long roomId);

    List<Equipment> findByRoomIdAndFunctional(Long roomId, boolean functional);

    boolean existsByIdAndRoomId(Long id, Long roomId);
}
