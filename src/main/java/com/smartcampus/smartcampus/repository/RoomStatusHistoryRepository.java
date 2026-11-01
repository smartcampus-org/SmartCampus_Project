package com.smartcampus.smartcampus.repository;

import com.smartcampus.smartcampus.entity.RoomStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * BACKEND 5 — Accès à l'historique des statuts de salles.
 */
public interface RoomStatusHistoryRepository extends JpaRepository<RoomStatusHistory, Long> {

    Page<RoomStatusHistory> findByRoomId(Long roomId, Pageable pageable);
}
