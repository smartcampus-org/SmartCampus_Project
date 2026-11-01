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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * BACKEND 8 — Tests d'intégration des endpoints Salles.
 * Utilise H2 en mémoire (profil "test").
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("RoomController — Tests d'intégration")
class RoomControllerIntegrationTest {

    @Autowired private MockMvc              mockMvc;
    @Autowired private RoomRepository       roomRepository;
    @Autowired private BuildingRepository   buildingRepository;
    @Autowired private RoleRepository       roleRepository;
    @Autowired private UserRepository       userRepository;
    @Autowired private PasswordEncoder      passwordEncoder;
    @Autowired private JwtService           jwtService;

    private String adminToken;
    private String etudiantToken;
    private Building building;
    private Room     testRoom;

    @BeforeEach
    void setUp() {
        // Rôles
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role r = new Role(); r.setName("ADMIN"); return roleRepository.save(r);
        });
        Role etudiantRole = roleRepository.findByName("ETUDIANT").orElseGet(() -> {
            Role r = new Role(); r.setName("ETUDIANT"); return roleRepository.save(r);
        });

        // Utilisateurs
        User admin = buildUser("room.admin@smartcampus.ma", adminRole);
        User etudiant = buildUser("room.etudiant@smartcampus.ma", etudiantRole);

        adminToken    = jwtService.generateToken(admin);
        etudiantToken = jwtService.generateToken(etudiant);

        // Bâtiment de test
        building = new Building();
        building.setName("Test Building");
        building.setFloors(2);
        buildingRepository.save(building);

        // Salle de test
        testRoom = new Room();
        testRoom.setRoomNumber("T101");
        testRoom.setName("Test Room");
        testRoom.setBuilding(building);
        testRoom.setFloor(0);
        testRoom.setCapacity(30);
        testRoom.setType(RoomType.SALLE_COURS);
        testRoom.setStatus(RoomStatus.DISPONIBLE);
        roomRepository.save(testRoom);
    }

    private User buildUser(String email, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setFirstName("Test");
            u.setLastName("User");
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode("Pass@12345"));
            u.setRole(role);
            u.setEnabled(true);
            u.setLocked(false);
            u.setFailedLoginAttempts(0);
            return userRepository.save(u);
        });
    }

    // =========================================================================
    // GET /api/rooms — liste paginée
    // =========================================================================

    @Test
    @DisplayName("BACKEND 2 : GET /api/rooms → 200 + contenu paginé")
    void findAll_authenticated_returns200() throws Exception {
        mockMvc.perform(get("/api/rooms")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("BACKEND 7 : GET /api/rooms sans token → 403")
    void findAll_noToken_returns403() throws Exception {
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // GET /api/rooms/{id}
    // =========================================================================

    @Test
    @DisplayName("BACKEND 2 : GET /api/rooms/{id} → 200 + détail")
    void findById_existing_returns200() throws Exception {
        mockMvc.perform(get("/api/rooms/" + testRoom.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomNumber").value("T101"))
                .andExpect(jsonPath("$.status").value("DISPONIBLE"))
                .andExpect(jsonPath("$.equipments").isArray());
    }

    @Test
    @DisplayName("BACKEND 2 : GET /api/rooms/{id} inexistant → 404")
    void findById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/rooms/99999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("99999")));
    }

    // =========================================================================
    // GET /api/rooms/search
    // =========================================================================

    @Test
    @DisplayName("BACKEND 2 : GET /api/rooms/search?keyword=T101 → résultat trouvé")
    void search_byKeyword_returnsResult() throws Exception {
        mockMvc.perform(get("/api/rooms/search")
                        .param("keyword", "T101")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].roomNumber").value("T101"));
    }

    @Test
    @DisplayName("BACKEND 2 : GET /api/rooms/search?status=FERMEE → liste vide")
    void search_noMatch_returnsEmpty() throws Exception {
        mockMvc.perform(get("/api/rooms/search")
                        .param("status", "FERMEE")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    // =========================================================================
    // POST /api/rooms — création
    // =========================================================================

    @Test
    @DisplayName("BACKEND 3 : POST /api/rooms (ADMIN) → 201")
    void create_asAdmin_returns201() throws Exception {
        String body = """
                {
                  "roomNumber": "T201",
                  "name": "New Room",
                  "buildingId": %d,
                  "floor": 1,
                  "capacity": 50,
                  "type": "SALLE_COURS",
                  "status": "DISPONIBLE"
                }
                """.formatted(building.getId());

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomNumber").value("T201"))
                .andExpect(jsonPath("$.type").value("SALLE_COURS"));
    }

    @Test
    @DisplayName("BACKEND 3 : POST /api/rooms (ETUDIANT) → 403")
    void create_asEtudiant_returns403() throws Exception {
        String body = """
                {
                  "roomNumber": "T999",
                  "buildingId": %d,
                  "floor": 0,
                  "capacity": 30,
                  "type": "SALLE_COURS"
                }
                """.formatted(building.getId());

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + etudiantToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("BACKEND 3 : POST /api/rooms doublon → 409")
    void create_duplicateNumber_returns409() throws Exception {
        String body = """
                {
                  "roomNumber": "T101",
                  "buildingId": %d,
                  "floor": 0,
                  "capacity": 30,
                  "type": "SALLE_COURS"
                }
                """.formatted(building.getId());

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
    }

    // =========================================================================
    // PUT /api/rooms/{id} — modification
    // =========================================================================

    @Test
    @DisplayName("BACKEND 3 : PUT /api/rooms/{id} → 200 mise à jour")
    void update_valid_returns200() throws Exception {
        String body = """
                {
                  "roomNumber": "T101",
                  "name": "Salle modifiée",
                  "buildingId": %d,
                  "floor": 0,
                  "capacity": 60,
                  "type": "SALLE_COURS"
                }
                """.formatted(building.getId());

        mockMvc.perform(put("/api/rooms/" + testRoom.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capacity").value(60))
                .andExpect(jsonPath("$.name").value("Salle modifiée"));
    }

    // =========================================================================
    // DELETE /api/rooms/{id}
    // =========================================================================

    @Test
    @DisplayName("BACKEND 3 : DELETE /api/rooms/{id} → 200")
    void delete_existing_returns200() throws Exception {
        mockMvc.perform(delete("/api/rooms/" + testRoom.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Salle supprimée avec succès"));
    }

    // =========================================================================
    // PATCH /api/rooms/{id}/status — changement de statut
    // =========================================================================

    @Test
    @DisplayName("BACKEND 5 : PATCH /api/rooms/{id}/status → 200 + nouveau statut")
    void changeStatus_valid_returns200() throws Exception {
        String body = """
                {
                  "newStatus": "EN_MAINTENANCE",
                  "reason": "Travaux de peinture"
                }
                """;

        mockMvc.perform(patch("/api/rooms/" + testRoom.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EN_MAINTENANCE"));
    }

    // =========================================================================
    // GET /api/rooms/{id}/status-history
    // =========================================================================

    @Test
    @DisplayName("BACKEND 5 : GET /api/rooms/{id}/status-history → 200 + liste paginée")
    void getStatusHistory_returns200() throws Exception {
        mockMvc.perform(get("/api/rooms/" + testRoom.getId() + "/status-history")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // =========================================================================
    // GET /api/rooms/export — CSV
    // =========================================================================

    @Test
    @DisplayName("BACKEND 6 : GET /api/rooms/export → 200 + CSV")
    void exportCsv_returns200WithCsvContent() throws Exception {
        mockMvc.perform(get("/api/rooms/export")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        containsString("smartcampus_rooms.csv")))
                .andExpect(content().contentTypeCompatibleWith("text/csv"));
    }

    // =========================================================================
    // SC-21 — Salle FERMEE invisible pour l'étudiant
    // =========================================================================

    @Test
    @DisplayName("SC-21 : GET /api/rooms/{id} salle FERMEE → 404 pour étudiant")
    void findById_fermeeSalle_returns404ForEtudiant() throws Exception {
        // Mettre la salle de test en FERMEE
        testRoom.setStatus(RoomStatus.FERMEE);
        roomRepository.save(testRoom);

        mockMvc.perform(get("/api/rooms/" + testRoom.getId())
                        .header("Authorization", "Bearer " + etudiantToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("SC-21 : GET /api/rooms/{id} salle FERMEE → 200 pour admin")
    void findById_fermeeSalle_returns200ForAdmin() throws Exception {
        testRoom.setStatus(RoomStatus.FERMEE);
        roomRepository.save(testRoom);

        mockMvc.perform(get("/api/rooms/" + testRoom.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FERMEE"));
    }

    @Test
    @DisplayName("SC-21 : GET /api/rooms (liste) → salle FERMEE absente pour étudiant")
    void findAll_fermeeSalle_notVisibleForEtudiant() throws Exception {
        testRoom.setStatus(RoomStatus.FERMEE);
        roomRepository.save(testRoom);

        mockMvc.perform(get("/api/rooms")
                        .header("Authorization", "Bearer " + etudiantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.status == 'FERMEE')]").isEmpty());
    }

    @Test
    @DisplayName("SC-21 : GET /api/rooms/search?status=FERMEE → page vide pour étudiant")
    void search_fermeeStatus_returnsEmptyForEtudiant() throws Exception {
        testRoom.setStatus(RoomStatus.FERMEE);
        roomRepository.save(testRoom);

        mockMvc.perform(get("/api/rooms/search")
                        .param("status", "FERMEE")
                        .header("Authorization", "Bearer " + etudiantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)));
    }
}
