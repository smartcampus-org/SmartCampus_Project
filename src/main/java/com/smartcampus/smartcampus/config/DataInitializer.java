
package com.smartcampus.smartcampus.config;

import com.smartcampus.smartcampus.entity.*;
import com.smartcampus.smartcampus.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            BuildingRepository buildingRepository,
            RoomRepository roomRepository
    ) {

        return args -> {

            // Initialisation des rôles
            createRoleIfNotExists(roleRepository, "ETUDIANT");
            createRoleIfNotExists(roleRepository, "PROFESSEUR");
            createRoleIfNotExists(roleRepository, "PERSONNEL");
            createRoleIfNotExists(roleRepository, "ADMIN");

            // Création d'un compte ADMIN de test
            createAdminIfNotExists(userRepository, roleRepository, passwordEncoder);
            createEtudiantIfNotExists(userRepository, roleRepository, passwordEncoder);

            // BACKEND 1 — Données de démonstration : bâtiments + salles
            initBuildingsAndRooms(buildingRepository, roomRepository);
        };
    }

    private void createRoleIfNotExists(RoleRepository roleRepository, String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
        }
    }

    private void createAdminIfNotExists(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        String adminEmail = "admin@smartcampus.ma";
        if (userRepository.findByEmail(adminEmail).isPresent()) return;

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Le rôle ADMIN n'existe pas"));

        User admin = new User();
        admin.setFirstName("Admin");
        admin.setLastName("SmartCampus");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("Admin@12345"));
        admin.setRole(adminRole);
        admin.setEnabled(true);
        admin.setLocked(false);
        admin.setFailedLoginAttempts(0);
        userRepository.save(admin);
    }

    private void createEtudiantIfNotExists(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {

        String email = "etudiant@smartcampus.ma";
        if (userRepository.findByEmail(email).isPresent()) return;

        Role etudiantRole = roleRepository.findByName("ETUDIANT")
                .orElseThrow(() -> new RuntimeException("Rôle ETUDIANT introuvable"));

        User etudiant = new User();
        etudiant.setFirstName("Test");
        etudiant.setLastName("Etudiant");
        etudiant.setEmail(email);
        etudiant.setPassword(passwordEncoder.encode("Etudiant@12345"));
        etudiant.setRole(etudiantRole);
        etudiant.setEnabled(true);
        etudiant.setLocked(false);
        etudiant.setFailedLoginAttempts(0);
        userRepository.save(etudiant);
    }

    // -------------------------------------------------------------------------
    // BACKEND 1 — Données de démonstration
    // -------------------------------------------------------------------------

    private void initBuildingsAndRooms(
            BuildingRepository buildingRepository,
            RoomRepository roomRepository) {

        if (buildingRepository.count() > 0) return; // déjà initialisé

        // Bâtiment A
        Building batA = new Building();
        batA.setName("Bâtiment A");
        batA.setAddress("Campus principal, aile nord");
        batA.setFloors(3);
        buildingRepository.save(batA);

        // Bâtiment B
        Building batB = new Building();
        batB.setName("Bâtiment B");
        batB.setAddress("Campus principal, aile sud");
        batB.setFloors(2);
        buildingRepository.save(batB);

        // Salles du Bâtiment A
        createRoom(roomRepository, "A101", "Amphithéâtre 1",  batA, 0, 200, RoomType.AMPHITHEATRE, RoomStatus.DISPONIBLE);
        createRoom(roomRepository, "A201", "Salle de cours 1", batA, 1, 40,  RoomType.SALLE_COURS,  RoomStatus.DISPONIBLE);
        createRoom(roomRepository, "A202", "Labo Informatique", batA, 1, 30, RoomType.LABORATOIRE,  RoomStatus.DISPONIBLE);
        createRoom(roomRepository, "A301", "Salle TP Réseaux", batA, 2, 25,  RoomType.SALLE_TP,     RoomStatus.EN_MAINTENANCE);

        // Salles du Bâtiment B
        createRoom(roomRepository, "B101", "Salle de réunion", batB, 0, 20, RoomType.SALLE_REUNION, RoomStatus.DISPONIBLE);
        createRoom(roomRepository, "B201", "Salle de cours 2", batB, 1, 35, RoomType.SALLE_COURS,   RoomStatus.DISPONIBLE);
    }

    private void createRoom(
            RoomRepository roomRepository,
            String number, String name,
            Building building,
            int floor, int capacity,
            RoomType type, RoomStatus status) {

        if (roomRepository.existsByRoomNumberAndBuildingId(number, building.getId())) return;

        Room room = new Room();
        room.setRoomNumber(number);
        room.setName(name);
        room.setBuilding(building);
        room.setFloor(floor);
        room.setCapacity(capacity);
        room.setType(type);
        room.setStatus(status);
        roomRepository.save(room);
    }
}
