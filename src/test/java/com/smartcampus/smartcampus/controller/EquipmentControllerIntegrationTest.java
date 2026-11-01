package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.entity.*;
import com.smartcampus.smartcampus.repository.*;
import com.smartcampus.smartcampus.service.JwtService;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * BACKEND 8 — Tests d'intégration des endpoints Équipements.
 * Utilise H2 en mémoire (profil "test").
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("EquipmentController — Tests d'intégration")
class EquipmentControllerIntegrationTest {

    @Autowired private MockMvc              mockMvc;
    @Autowired private RoomRepository       roomRepository;
    @Autowired private BuildingRepository   buildingRepository;
    @Autowired private EquipmentRepository  equipmentRepository;
    @Autowired private RoleRepository       roleRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;
    @Autowired private JwtService           jwtService;

    private String adminToken;
    private Room   testRoom;
    private Equipment testEquipment;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role r = new Role(); r.setName("ADMIN"); return roleRepository.save(r);
        });

        User admin = userRepository.findByEmail("eq.admin@smartcampus.ma").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Eq"); u.setLastName("Admin");
            u.setEmail("eq.admin@smartcampus.ma");
            u.setPassword(passwordEncoder.encode("Pass@12345"));
            u.setRole(adminRole); u.setEnabled(true);
            u.setLocked(false); u.setFailedLoginAttempts(0);
            return userRepository.save(u);
        });
        adminToken = jwtService.generateToken(admin);

        Building building = new Building();
        building.setName("Eq Building");
        building.setFloors(1);
        building.setRooms(new ArrayList<>());
        buildingRepository.save(building);

        testRoom = new Room();
        testRoom.setRoomNumber("EQ101");
        testRoom.setBuilding(building);
        testRoom.setFloor(0);
        testRoom.setCapacity(20);
        testRoom.setType(RoomType.LABORATOIRE);
        testRoom.setStatus(RoomStatus.DISPONIBLE);
        testRoom.setEquipments(new ArrayList<>());
        testRoom.setStatusHistory(new ArrayList<>());
        LocalDateTime now = LocalDateTime.now();
        testRoom.setCreatedAt(now);
        testRoom.setUpdatedAt(now);
        roomRepository.save(testRoom);

        testEquipment = new Equipment();
        testEquipment.setName("Projecteur");
        testEquipment.setType("MULTIMEDIA");
        testEquipment.setQuantity(1);
        testEquipment.setFunctional(true);
        testEquipment.setRoom(testRoom);
        equipmentRepository.save(testEquipment);
    }

    // =========================================================================
    // GET /api/rooms/{roomId}/equipments
    // =========================================================================

    @Test
    @DisplayName("BACKEND 4 : GET équipements d'une salle → 200 + liste")
    void findByRoom_returns200() throws Exception {
        mockMvc.perform(get("/api/rooms/" + testRoom.getId() + "/equipments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Projecteur"));
    }

    // =========================================================================
    // POST /api/rooms/{roomId}/equipments
    // =========================================================================

    @Test
    @DisplayName("BACKEND 4 : POST ajouter un équipement → 201")
    void create_valid_returns201() throws Exception {
        String body = """
                {
                  "name": "Tableau interactif",
                  "type": "MULTIMEDIA",
                  "quantity": 1,
                  "functional": true
                }
                """;

        mockMvc.perform(post("/api/rooms/" + testRoom.getId() + "/equipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Tableau interactif"))
                .andExpect(jsonPath("$.roomId").value(testRoom.getId()));
    }

    // =========================================================================
    // PUT /api/rooms/{roomId}/equipments/{id}
    // =========================================================================

    @Test
    @DisplayName("BACKEND 4 : PUT modifier un équipement → 200")
    void update_valid_returns200() throws Exception {
        String body = """
                {
                  "name": "Projecteur Sony",
                  "type": "MULTIMEDIA",
                  "quantity": 2,
                  "functional": false,
                  "notes": "En panne"
                }
                """;

        mockMvc.perform(put("/api/rooms/" + testRoom.getId()
                        + "/equipments/" + testEquipment.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Projecteur Sony"))
                .andExpect(jsonPath("$.functional").value(false));
    }

    // =========================================================================
    // DELETE /api/rooms/{roomId}/equipments/{id}
    // =========================================================================

    @Test
    @DisplayName("BACKEND 4 : DELETE équipement → 200")
    void delete_existing_returns200() throws Exception {
        mockMvc.perform(delete("/api/rooms/" + testRoom.getId()
                        + "/equipments/" + testEquipment.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Équipement supprimé avec succès"));
    }

    @Test
    @DisplayName("BACKEND 4 : DELETE équipement inexistant → 404")
    void delete_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/api/rooms/" + testRoom.getId() + "/equipments/99999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }
}
