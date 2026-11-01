package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.*;
import com.smartcampus.smartcampus.entity.*;
import com.smartcampus.smartcampus.exception.*;
import com.smartcampus.smartcampus.repository.*;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * SC-21 — Constante du rôle étudiant utilisée pour filtrer les salles FERMEE.
 */

/**
 * BACKEND 2 / BACKEND 3 / BACKEND 5 / SC-21 — Gestion complète des salles.
 * <ul>
 *   <li>BACKEND 2 : consultation et recherche paginée</li>
 *   <li>BACKEND 3 : création, modification, suppression</li>
 *   <li>BACKEND 5 : changement de statut avec historique</li>
 *   <li>SC-21    : les salles FERMEE sont invisibles pour les étudiants</li>
 * </ul>
 */
@Service
public class RoomService {

    /** Rôle étudiant — les salles FERMEE lui sont masquées (SC-21). */
    private static final String ROLE_ETUDIANT = "ROLE_ETUDIANT";

    private final RoomRepository              roomRepository;
    private final BuildingRepository          buildingRepository;
    private final RoomStatusHistoryRepository historyRepository;
    private final BuildingService             buildingService;

    public RoomService(
            RoomRepository roomRepository,
            BuildingRepository buildingRepository,
            RoomStatusHistoryRepository historyRepository,
            BuildingService buildingService
    ) {
        this.roomRepository    = roomRepository;
        this.buildingRepository = buildingRepository;
        this.historyRepository = historyRepository;
        this.buildingService   = buildingService;
    }

    // =========================================================================
    // BACKEND 2 — Consultation et recherche
    // =========================================================================

    /**
     * Retourne toutes les salles sous forme résumée, avec pagination.
     * SC-21 — Les salles FERMEE sont exclues pour les étudiants.
     *
     * @param pageable  pagination et tri
     * @param userRole  rôle Spring Security de l'utilisateur (ex: "ROLE_ETUDIANT")
     */
    public Page<RoomSummaryResponse> findAll(Pageable pageable, String userRole) {
        // Pour les étudiants : on force le filtre en excluant FERMEE via la recherche
        if (ROLE_ETUDIANT.equals(userRole)) {
            return roomRepository.searchExcludingStatus(
                    null, null, null, null, null, RoomStatus.FERMEE, pageable)
                    .map(this::toSummary);
        }
        return roomRepository.findAll(pageable).map(this::toSummary);
    }

    /**
     * Retourne le détail complet d'une salle (avec équipements).
     * SC-21 — Une salle FERMEE retourne 404 pour un étudiant.
     *
     * @param id       identifiant de la salle
     * @param userRole rôle Spring Security de l'utilisateur
     */
    public RoomDetailResponse findById(Long id, String userRole) {
        Room room = getOrThrow(id);
        if (ROLE_ETUDIANT.equals(userRole) && room.getStatus() == RoomStatus.FERMEE) {
            throw new RoomNotFoundException(id);
        }
        return toDetail(room);
    }

    /**
     * Recherche multi-critères avec filtres optionnels et pagination.
     * SC-21 — Les salles FERMEE sont exclues pour les étudiants.
     *
     * @param keyword     texte libre (numéro, nom, bâtiment)
     * @param status      filtre par statut
     * @param type        filtre par type
     * @param buildingId  filtre par bâtiment
     * @param minCapacity capacité minimale
     * @param pageable    paramètres de pagination / tri
     * @param userRole    rôle Spring Security de l'utilisateur
     */
    public Page<RoomSummaryResponse> search(
            String keyword,
            RoomStatus status,
            RoomType type,
            Long buildingId,
            Integer minCapacity,
            Pageable pageable,
            String userRole
    ) {
        // Pour un étudiant : si le filtre demandé est explicitement FERMEE,
        // on retourne une page vide (il ne peut pas accéder à ces salles).
        if (ROLE_ETUDIANT.equals(userRole)) {
            if (status == RoomStatus.FERMEE) {
                return Page.empty(pageable);
            }
            return roomRepository
                    .searchExcludingStatus(keyword, status, type, buildingId, minCapacity,
                            RoomStatus.FERMEE, pageable)
                    .map(this::toSummary);
        }
        return roomRepository
                .search(keyword, status, type, buildingId, minCapacity, pageable)
                .map(this::toSummary);
    }

    // =========================================================================
    // BACKEND 3 — Création
    // =========================================================================

    @Transactional
    public RoomDetailResponse create(RoomRequest request) {
        Building building = buildingRepository.findById(request.buildingId())
                .orElseThrow(() -> new BuildingNotFoundException(request.buildingId()));

        if (roomRepository.existsByRoomNumberAndBuildingId(
                request.roomNumber(), request.buildingId())) {
            throw new RoomNumberAlreadyExistsException(request.roomNumber(), building.getName());
        }

        Room room = new Room();
        applyRequest(room, request, building);
        return toDetail(roomRepository.save(room));
    }

    // =========================================================================
    // BACKEND 3 — Modification
    // =========================================================================

    @Transactional
    public RoomDetailResponse update(Long id, RoomRequest request) {
        Room room = getOrThrow(id);
        Building building = buildingRepository.findById(request.buildingId())
                .orElseThrow(() -> new BuildingNotFoundException(request.buildingId()));

        // Vérifie l'unicité uniquement si le numéro ou le bâtiment change
        boolean numberChanged  = !room.getRoomNumber().equals(request.roomNumber());
        boolean buildingChanged = !room.getBuilding().getId().equals(request.buildingId());

        if ((numberChanged || buildingChanged)
                && roomRepository.existsByRoomNumberAndBuildingId(
                request.roomNumber(), request.buildingId())) {
            throw new RoomNumberAlreadyExistsException(request.roomNumber(), building.getName());
        }

        applyRequest(room, request, building);
        return toDetail(roomRepository.save(room));
    }

    // =========================================================================
    // BACKEND 3 — Suppression
    // =========================================================================

    @Transactional
    public void delete(Long id) {
        getOrThrow(id);
        roomRepository.deleteById(id);
    }

    // =========================================================================
    // BACKEND 5 — Changement de statut avec historique
    // =========================================================================

    @Transactional
    public RoomDetailResponse changeStatus(Long roomId, StatusChangeRequest request,
                                            String changedBy) {
        Room room = getOrThrow(roomId);

        RoomStatus oldStatus = room.getStatus();
        RoomStatus newStatus = request.newStatus();

        // Enregistre l'historique même si le statut est identique (traçabilité)
        RoomStatusHistory history = new RoomStatusHistory();
        history.setRoom(room);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setReason(request.reason());
        historyRepository.save(history);

        room.setStatus(newStatus);
        return toDetail(roomRepository.save(room));
    }

    /**
     * Retourne l'historique paginé des changements de statut d'une salle.
     */
    public Page<StatusHistoryResponse> getStatusHistory(Long roomId, Pageable pageable) {
        getOrThrow(roomId); // vérifie que la salle existe
        return historyRepository.findByRoomId(roomId, pageable)
                .map(this::toHistoryResponse);
    }

    // =========================================================================
    // BACKEND 6 — Export CSV (données brutes, formattage dans le controller)
    // =========================================================================

    /**
     * SC-21 — Les étudiants n'exportent pas les salles FERMEE.
     */
    public List<Room> findAllForExport(String userRole) {
        List<Room> rooms = roomRepository.findAllWithEquipmentsAndBuilding();
        if (ROLE_ETUDIANT.equals(userRole)) {
            return rooms.stream()
                    .filter(r -> r.getStatus() != RoomStatus.FERMEE)
                    .toList();
        }
        return rooms;
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    public Room getOrThrow(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException(id));
    }

    private void applyRequest(Room room, RoomRequest req, Building building) {
        room.setRoomNumber(req.roomNumber());
        room.setName(req.name());
        room.setBuilding(building);
        room.setFloor(req.floor());
        room.setCapacity(req.capacity());
        room.setType(req.type());
        room.setDescription(req.description());
        if (req.status() != null) {
            room.setStatus(req.status());
        }
    }

    RoomSummaryResponse toSummary(Room r) {
        return new RoomSummaryResponse(
                r.getId(),
                r.getRoomNumber(),
                r.getName(),
                r.getBuilding().getName(),
                r.getBuilding().getId(),
                r.getFloor(),
                r.getCapacity(),
                r.getType(),
                r.getStatus(),
                r.getEquipments().size(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private RoomDetailResponse toDetail(Room r) {
        List<EquipmentResponse> equipments = r.getEquipments()
                .stream()
                .map(e -> new EquipmentResponse(
                        e.getId(), e.getName(), e.getType(),
                        e.getQuantity(), e.isFunctional(), e.getNotes(),
                        r.getId()))
                .toList();

        return new RoomDetailResponse(
                r.getId(),
                r.getRoomNumber(),
                r.getName(),
                buildingService.toResponse(r.getBuilding()),
                r.getFloor(),
                r.getCapacity(),
                r.getType(),
                r.getStatus(),
                r.getDescription(),
                equipments,
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private StatusHistoryResponse toHistoryResponse(RoomStatusHistory h) {
        return new StatusHistoryResponse(
                h.getId(),
                h.getRoom().getId(),
                h.getOldStatus(),
                h.getNewStatus(),
                h.getChangedBy(),
                h.getReason(),
                h.getChangedAt()
        );
    }
}
