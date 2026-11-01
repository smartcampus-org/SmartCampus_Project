package com.smartcampus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * BACKEND 4 — Équipement associé à une salle.
 * <p>
 * Exemples : projecteur, tableau interactif, climatisation, etc.
 */
@Entity
@Table(
    name = "equipments",
    indexes = {
        @Index(name = "idx_equipments_room", columnList = "room_id"),
        @Index(name = "idx_equipments_type", columnList = "type")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom de l'équipement (ex : "Projecteur BenQ"). */
    @Column(nullable = false, length = 150)
    private String name;

    /** Catégorie de l'équipement (ex : "MULTIMEDIA", "MOBILIER", "CLIMATISATION"). */
    @Column(nullable = false, length = 50)
    private String type;

    /** Quantité disponible dans la salle. */
    @Column(nullable = false)
    private int quantity = 1;

    /** Indique si l'équipement est fonctionnel. */
    @Column(nullable = false)
    private boolean functional = true;

    /** Remarques libres (modèle, numéro de série, etc.). */
    @Column(length = 300)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
}
