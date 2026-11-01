package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.EquipmentRequest;
import com.smartcampus.smartcampus.dto.EquipmentResponse;
import com.smartcampus.smartcampus.entity.Building;
import com.smartcampus.smartcampus.entity.Equipment;
import com.smartcampus.smartcampus.entity.Room;
import com.smartcampus.smartcampus.entity.RoomStatus;
import com.smartcampus.smartcampus.entity.RoomType;
import com.smartcampus.smartcampus.exception.EquipmentNotFoundException;
import com.smartcampus.smartcampus.repository.EquipmentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * BACKEND 8 — Tests unitaires du service des équipements.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EquipmentService — Tests unitaires")
class EquipmentServiceTest {

    @Mock private EquipmentRepository equipmentRepository;
    @Mock private RoomService         roomService;

    @InjectMocks
    private EquipmentService equipmentService;

    private Room      room;
    private Equipment equipment;

    @BeforeEach
    void setUp() {
        Building building = new Building();
        building.setId(1L);
        building.setName("Bâtiment A");
        building.setRooms(new ArrayList<>());

        room = new Room();
        room.setId(1L);
        room.setRoomNumber("A101");
        room.setBuilding(building);
        room.setCapacity(40);
        room.setFloor(0);
        room.setType(RoomType.SALLE_COURS);
        room.setStatus(RoomStatus.DISPONIBLE);
        room.setEquipments(new ArrayList<>());
        room.setStatusHistory(new ArrayList<>());
        LocalDateTime now = LocalDateTime.now();
        room.setCreatedAt(now);
        room.setUpdatedAt(now);

        equipment = new Equipment();
        equipment.setId(10L);
        equipment.setName("Projecteur BenQ");
        equipment.setType("MULTIMEDIA");
        equipment.setQuantity(2);
        equipment.setFunctional(true);
        equipment.setNotes("Modèle MX808STH");
        equipment.setRoom(room);
    }

    // =========================================================================
    // findByRoom
    // =========================================================================

    @Test
    @DisplayName("findByRoom : salle existante → liste des équipements")
    void findByRoom_existing_returnsList() {
        when(roomService.getOrThrow(1L)).thenReturn(room);
        when(equipmentRepository.findByRoomId(1L)).thenReturn(List.of(equipment));

        List<EquipmentResponse> result = equipmentService.findByRoom(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Projecteur BenQ");
        assertThat(result.get(0).type()).isEqualTo("MULTIMEDIA");
    }

    // =========================================================================
    // create
    // =========================================================================

    @Test
    @DisplayName("create : données valides → équipement créé")
    void create_valid_returnsResponse() {
        EquipmentRequest request = new EquipmentRequest(
                "Tableau interactif", "MULTIMEDIA", 1, true, "Marque Smart");

        when(roomService.getOrThrow(1L)).thenReturn(room);
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(inv -> {
            Equipment e = inv.getArgument(0);
            e.setId(11L);
            return e;
        });

        EquipmentResponse response = equipmentService.create(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Tableau interactif");
        assertThat(response.roomId()).isEqualTo(1L);
        verify(equipmentRepository).save(any(Equipment.class));
    }

    // =========================================================================
    // update
    // =========================================================================

    @Test
    @DisplayName("update : équipement existant → mis à jour")
    void update_existing_returnsUpdated() {
        EquipmentRequest request = new EquipmentRequest(
                "Projecteur Sony", "MULTIMEDIA", 3, false, "En panne");

        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(equipmentRepository.save(any(Equipment.class))).thenReturn(equipment);

        EquipmentResponse response = equipmentService.update(1L, 10L, request);

        assertThat(response).isNotNull();
        verify(equipmentRepository).save(any(Equipment.class));
    }

    @Test
    @DisplayName("update : équipement appartenant à une autre salle → EquipmentNotFoundException")
    void update_wrongRoom_throwsException() {
        equipment.getRoom().setId(99L); // l'équipement appartient à la salle 99, pas 1
        room.setId(1L);

        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        EquipmentRequest request = new EquipmentRequest("X", "X", 1, true, null);

        assertThatThrownBy(() -> equipmentService.update(1L, 10L, request))
                .isInstanceOf(EquipmentNotFoundException.class);
    }

    // =========================================================================
    // delete
    // =========================================================================

    @Test
    @DisplayName("delete : équipement existant → suppression OK")
    void delete_existing_deletesEquipment() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));

        equipmentService.delete(1L, 10L);

        verify(equipmentRepository).deleteById(10L);
    }

    @Test
    @DisplayName("delete : équipement inexistant → EquipmentNotFoundException")
    void delete_notFound_throwsException() {
        when(equipmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> equipmentService.delete(1L, 99L))
                .isInstanceOf(EquipmentNotFoundException.class)
                .hasMessageContaining("99");
    }
}
