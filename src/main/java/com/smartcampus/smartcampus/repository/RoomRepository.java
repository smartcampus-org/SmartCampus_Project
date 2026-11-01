package com.smartcampus.smartcampus.repository;

import com.smartcampus.smartcampus.entity.Room;
import com.smartcampus.smartcampus.entity.RoomStatus;
import com.smartcampus.smartcampus.entity.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * BACKEND 2 — Requêtes de consultation et de recherche des salles.
 */
public interface RoomRepository extends JpaRepository<Room, Long>,
        JpaSpecificationExecutor<Room> {

    /** Vérifie l'unicité du numéro dans un bâtiment. */
    boolean existsByRoomNumberAndBuildingId(String roomNumber, Long buildingId);

    /** Recherche par numéro exact dans un bâtiment. */
    Optional<Room> findByRoomNumberAndBuildingId(String roomNumber, Long buildingId);

    /** Toutes les salles d'un bâtiment. */
    List<Room> findByBuildingId(Long buildingId);

    /** Salles filtrées par statut, avec pagination. */
    Page<Room> findByStatus(RoomStatus status, Pageable pageable);

    /** Salles filtrées par type, avec pagination. */
    Page<Room> findByType(RoomType type, Pageable pageable);

    /** Salles disponibles avec capacité minimale. */
    @Query("SELECT r FROM Room r WHERE r.status = 'DISPONIBLE' AND r.capacity >= :minCapacity")
    List<Room> findAvailableWithMinCapacity(@Param("minCapacity") int minCapacity);

    /**
     * BACKEND 2 — Recherche textuelle multi-critères avec filtres optionnels.
     * Le paramètre {@code keyword} est comparé au numéro, nom et description.
     */
    @Query("""
            SELECT DISTINCT r FROM Room r
            JOIN r.building b
            WHERE (:keyword IS NULL
                   OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(r.name)       LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(b.name)       LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:status   IS NULL OR r.status   = :status)
              AND (:type     IS NULL OR r.type     = :type)
              AND (:buildingId IS NULL OR b.id     = :buildingId)
              AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
            """)
    Page<Room> search(
            @Param("keyword")     String keyword,
            @Param("status")      RoomStatus status,
            @Param("type")        RoomType type,
            @Param("buildingId")  Long buildingId,
            @Param("minCapacity") Integer minCapacity,
            Pageable pageable
    );

    /**
     * SC-21 — Recherche identique mais exclut un statut donné (ex : FERMEE pour les étudiants).
     */
    @Query("""
            SELECT DISTINCT r FROM Room r
            JOIN r.building b
            WHERE (:keyword IS NULL
                   OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(r.name)       LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(b.name)       LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:status        IS NULL OR r.status = :status)
              AND (:type          IS NULL OR r.type   = :type)
              AND (:buildingId    IS NULL OR b.id     = :buildingId)
              AND (:minCapacity   IS NULL OR r.capacity >= :minCapacity)
              AND r.status <> :excludedStatus
            """)
    Page<Room> searchExcludingStatus(
            @Param("keyword")        String keyword,
            @Param("status")         RoomStatus status,
            @Param("type")           RoomType type,
            @Param("buildingId")     Long buildingId,
            @Param("minCapacity")    Integer minCapacity,
            @Param("excludedStatus") RoomStatus excludedStatus,
            Pageable pageable
    );

    /** BACKEND 6 — Toutes les salles avec leurs équipements (pour export CSV). */
    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.equipments LEFT JOIN FETCH r.building")
    List<Room> findAllWithEquipmentsAndBuilding();
}
