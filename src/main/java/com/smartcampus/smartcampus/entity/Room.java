package com.smartcampus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * BACKEND 1 — Entité principale représentant une salle du campus.
 * <p>
 * Chaque salle appartient à un {@link Building}, possède un type {@link RoomType},
 * un statut courant {@link RoomStatus}, une liste d'équipements {@link Equipment}
 * et un historique des changements de statut {@link RoomStatusHistory}.
 */
@Entity
@Table(
    name = "rooms",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_rooms_number_building", columnNames = {"room_number", "building_id"})
    },
    indexes = {
        @Index(name = "idx_rooms_status",   columnList = "status"),
        @Index(name = "idx_rooms_type",     columnList = "type"),
        @Index(name = "idx_rooms_building", columnList = "building_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Numéro / code de la salle (ex : "A101", "Lab3"). */
    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    /** Nom descriptif optionnel (ex : "Salle des promotions"). */
    @Column(length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    /** Étage (0 = rez-de-chaussée). */
    @Column(nullable = false)
    private int floor = 0;

    /** Capacité d'accueil (nombre de places). */
    @Column(nullable = false)
    private int capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomType type = RoomType.SALLE_COURS;

    /** Statut courant de la salle. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.DISPONIBLE;

    /** Description ou remarques libres. */
    @Column(length = 500)
    private String description;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Equipment> equipments = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC")
    private List<RoomStatusHistory> statusHistory = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
