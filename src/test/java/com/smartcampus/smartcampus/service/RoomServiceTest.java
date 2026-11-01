package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.*;
import com.smartcampus.smartcampus.entity.*;
import com.smartcampus.smartcampus.exception.*;
import com.smartcampus.smartcampus.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * BACKEND 8 — Tests unitaires du service des salles.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RoomService — Tests unitaires")
class RoomServiceTest {

    @Mock private RoomRepository              roomRepository;
    @Mock private BuildingRepository          buildingRepository;
    @Mock private RoomStatusHistoryRepository historyRepository;
    @Mock private BuildingService             buildingService;

    @InjectMocks
    private RoomService roomService;

    private Building building;
    private Room     room;

    @BeforeEach
    void setUp() {
        building = new Building();
        building.setId(1L);
        building.setName("Bâtiment A");
        building.setAddress("Aile nord");
        building.setFloors(3);
        building.setRooms(new ArrayList<>());

        room = new Room();
        room.setId(1L);
        room.setRoomNumber("A101");
        room.setName("Amphithéâtre");
        room.setBuilding(building);
        room.setFloor(0);
        room.setCapacity(200);
        room.setType(RoomType.AMPHITHEATRE);
        room.setStatus(RoomStatus.DISPONIBLE);
        room.setEquipments(new ArrayList<>());
        room.setStatusHistory(new ArrayList<>());

        LocalDateTime now = LocalDateTime.now();
        room.setCreatedAt(now);
        room.setUpdatedAt(now);
    }

    // =========================================================================
    // findById
    // =========================================================================

    @Test
    @DisplayName("findById : salle existante → retourne le détail")
    void findById_existing_returnsDetail() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(buildingService.toResponse(building))
                .thenReturn(new BuildingResponse(1L, "Bâtiment A", "Aile nord", 3, 0));

        RoomDetailResponse response = roomService.findById(1L, "ROLE_ADMIN");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.roomNumber()).isEqualTo("A101");
        assertThat(response.status()).isEqualTo(RoomStatus.DISPONIBLE);
    }

    @Test
    @DisplayName("findById : salle inexistante → RoomNotFoundException")
    void findById_notFound_throwsException() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.findById(99L, "ROLE_ADMIN"))
                .isInstanceOf(RoomNotFoundException.class)
                .hasMessageContaining("99");
    }

    // =========================================================================
    // create
    // =========================================================================

    @Test
    @DisplayName("create : données valides → salle créée")
    void create_validRequest_returnsDetail() {
        RoomRequest request = new RoomRequest(
                "A102", "Salle de cours",
                1L, 1, 40,
                RoomType.SALLE_COURS, RoomStatus.DISPONIBLE,
                "Description test");

        when(buildingRepository.findById(1L)).thenReturn(Optional.of(building));
        when(roomRepository.existsByRoomNumberAndBuildingId("A102", 1L)).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(2L);
            LocalDateTime now = LocalDateTime.now();
            r.setCreatedAt(now);
            r.setUpdatedAt(now);
            return r;
        });
        when(buildingService.toResponse(building))
                .thenReturn(new BuildingResponse(1L, "Bâtiment A", "Aile nord", 3, 0));

        RoomDetailResponse response = roomService.create(request);

        assertThat(response).isNotNull();
        assertThat(response.roomNumber()).isEqualTo("A102");
        assertThat(response.type()).isEqualTo(RoomType.SALLE_COURS);
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    @DisplayName("create : numéro de salle déjà pris → RoomNumberAlreadyExistsException")
    void create_duplicateNumber_throwsException() {
        RoomRequest request = new RoomRequest(
                "A101", null, 1L, 0, 40,
                RoomType.SALLE_COURS, null, null);

        when(buildingRepository.findById(1L)).thenReturn(Optional.of(building));
        when(roomRepository.existsByRoomNumberAndBuildingId("A101", 1L)).thenReturn(true);

        assertThatThrownBy(() -> roomService.create(request))
                .isInstanceOf(RoomNumberAlreadyExistsException.class);

        verify(roomRepository, never()).save(any());
    }

    @Test
    @DisplayName("create : bâtiment inexistant → BuildingNotFoundException")
    void create_buildingNotFound_throwsException() {
        RoomRequest request = new RoomRequest(
                "A102", null, 99L, 0, 40,
                RoomType.SALLE_COURS, null, null);

        when(buildingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.create(request))
                .isInstanceOf(BuildingNotFoundException.class)
                .hasMessageContaining("99");
    }

    // =========================================================================
    // update
    // =========================================================================

    @Test
    @DisplayName("update : données valides → salle mise à jour")
    void update_validRequest_returnsUpdated() {
        RoomRequest request = new RoomRequest(
                "A101", "Nouveau nom",
                1L, 0, 300,
                RoomType.AMPHITHEATRE, RoomStatus.DISPONIBLE, null);

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(buildingRepository.findById(1L)).thenReturn(Optional.of(building));
        when(roomRepository.existsByRoomNumberAndBuildingId("A101", 1L)).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(room);
        when(buildingService.toResponse(building))
                .thenReturn(new BuildingResponse(1L, "Bâtiment A", "Aile nord", 3, 0));

        RoomDetailResponse response = roomService.update(1L, request);

        assertThat(response).isNotNull();
        verify(roomRepository).save(any(Room.class));
    }

    // =========================================================================
    // delete
    // =========================================================================

    @Test
    @DisplayName("delete : salle existante → suppression OK")
    void delete_existing_deletesRoom() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        roomService.delete(1L);

        verify(roomRepository).deleteById(1L);
    }

    @Test
    @DisplayName("delete : salle inexistante → RoomNotFoundException")
    void delete_notFound_throwsException() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.delete(99L))
                .isInstanceOf(RoomNotFoundException.class);
    }

    // =========================================================================
    // changeStatus
    // =========================================================================

    @Test
    @DisplayName("changeStatus : statut valide → historique enregistré + statut mis à jour")
    void changeStatus_valid_updatesStatusAndLogsHistory() {
        StatusChangeRequest request = new StatusChangeRequest(
                RoomStatus.EN_MAINTENANCE, "Travaux de rénovation");

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(historyRepository.save(any(RoomStatusHistory.class))).thenAnswer(inv -> inv.getArgument(0));
        when(roomRepository.save(any(Room.class))).thenReturn(room);
        when(buildingService.toResponse(building))
                .thenReturn(new BuildingResponse(1L, "Bâtiment A", "Aile nord", 3, 0));

        RoomDetailResponse response = roomService.changeStatus(1L, request, "admin@smartcampus.ma");

        assertThat(response).isNotNull();
        verify(historyRepository).save(argThat(h ->
                h.getOldStatus() == RoomStatus.DISPONIBLE
                && h.getNewStatus() == RoomStatus.EN_MAINTENANCE
                && "admin@smartcampus.ma".equals(h.getChangedBy())
                && "Travaux de rénovation".equals(h.getReason())
        ));
        verify(roomRepository).save(any(Room.class));
    }

    // =========================================================================
    // search (délégation au repository)
    // =========================================================================

    @Test
    @DisplayName("search : retourne la page du repository")
    void search_delegatesToRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Room> page = new PageImpl<>(List.of(room));
        when(roomRepository.search(null, null, null, null, null, pageable)).thenReturn(page);

        Page<RoomSummaryResponse> result = roomService.search(null, null, null, null, null, pageable, "ROLE_ADMIN");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).roomNumber()).isEqualTo("A101");
    }

    // =========================================================================
    // SC-21 — Salle FERMEE invisible pour l'étudiant
    // =========================================================================

    @Test
    @DisplayName("SC-21 : findById salle FERMEE + rôle ETUDIANT → RoomNotFoundException")
    void findById_fermeeSalle_etudiant_throwsNotFound() {
        room.setStatus(RoomStatus.FERMEE);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> roomService.findById(1L, "ROLE_ETUDIANT"))
                .isInstanceOf(RoomNotFoundException.class);
    }

    @Test
    @DisplayName("SC-21 : findById salle FERMEE + rôle ADMIN → retourne le détail")
    void findById_fermeeSalle_admin_returnsDetail() {
        room.setStatus(RoomStatus.FERMEE);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(buildingService.toResponse(building))
                .thenReturn(new BuildingResponse(1L, "Bâtiment A", "Aile nord", 3, 0));

        RoomDetailResponse response = roomService.findById(1L, "ROLE_ADMIN");

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(RoomStatus.FERMEE);
    }
}
