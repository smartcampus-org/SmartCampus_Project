
package com.smartcampus.smartcampus.config;

import com.smartcampus.smartcampus.entity.Role;
import com.smartcampus.smartcampus.entity.User;
import com.smartcampus.smartcampus.repository.RoleRepository;
import com.smartcampus.smartcampus.repository.UserRepository;

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
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            // Initialisation des rôles
            createRoleIfNotExists(roleRepository, "ETUDIANT");
            createRoleIfNotExists(roleRepository, "PROFESSEUR");
            createRoleIfNotExists(roleRepository, "PERSONNEL");
            createRoleIfNotExists(roleRepository, "ADMIN");

            // Création d'un compte ADMIN de test
            createAdminIfNotExists(
                    userRepository,
                    roleRepository,
                    passwordEncoder
            );
            createEtudiantIfNotExists(userRepository, roleRepository, passwordEncoder);
        };
    }

    private void createRoleIfNotExists(
            RoleRepository roleRepository,
            String roleName
    ) {

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

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Le rôle ADMIN n'existe pas"
                        )
                );

        User admin = new User();

        admin.setFirstName("Admin");
        admin.setLastName("SmartCampus");
        admin.setEmail(adminEmail);

        // Mot de passe encodé avec BCrypt
        admin.setPassword(
                passwordEncoder.encode("Admin@12345")
        );

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

    if (userRepository.findByEmail(email).isPresent()) {
        return;
    }

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
}
