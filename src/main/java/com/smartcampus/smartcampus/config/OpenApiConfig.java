package com.smartcampus.smartcampus.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SC-100 / TECH 1 — Configuration de la documentation OpenAPI / Swagger UI.
 * Accessible à : http://localhost:8083/swagger-ui.html
 * <p>
 * Sprint 2 : ajout des modules Salles, Bâtiments et Équipements.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartCampusOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartCampus API")
                        .description("""
                                API REST de la plateforme SmartCampus.
                                
                                **Modules disponibles :**
                                - 🔐 Authentification (JWT, inscription, réinitialisation de mot de passe)
                                - 👤 Profil utilisateur
                                - 🏛️ Bâtiments (gestion du campus)
                                - 🚪 Salles (catalogue, recherche, statuts, historique)
                                - 🖥️ Équipements (par salle)
                                - 📤 Export CSV
                                
                                **Rôles :** ADMIN · PERSONNEL · PROFESSEUR · ETUDIANT
                                """)
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Équipe SmartCampus")
                                .email("contact@smartcampus.ma")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez votre token JWT (sans le préfixe 'Bearer')")));
    }
}
