package com.smartcampus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * BACKEND 5 — Historique des changements de statut d'une salle.
 * <p>
 * Chaque fois qu'un statut est modifié, une entrée est ajoutée ici,
 * permettant de tracer qui a changé quoi et pourquoi.
 */
@Entity
@Table(
    name = "room_status_history",
    indexes = {
        @Index(name = "idx_status_history_room",       columnList = "room_id"),
        @Index(name = "idx_status_history_changed_at", columnList = "changed_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class RoomStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private RoomStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 20)
    private RoomStatus newStatus;

    /** E-mail de l'utilisateur ayant effectué le changement. */
    @Column(name = "changed_by", nullable = false, length = 150)
    private String changedBy;

    /** Raison optionnelle du changement (ex : "Travaux de peinture"). */
    @Column(length = 300)
    private String reason;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
