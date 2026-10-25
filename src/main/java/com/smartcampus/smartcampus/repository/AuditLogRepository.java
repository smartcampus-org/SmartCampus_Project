package com.smartcampus.smartcampus.repository;

import com.smartcampus.smartcampus.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * SC-94 — Accès aux journaux d'audit.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByEmailOrderByCreatedAtDesc(String email);

    List<AuditLog> findByEventTypeOrderByCreatedAtDesc(String eventType);
}
