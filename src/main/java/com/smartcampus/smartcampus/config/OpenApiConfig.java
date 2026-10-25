package com.smartcampus.smartcampus.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SC-100 — Configuration de la documentation OpenAPI / Swagger UI.
 * Accessible à : http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartCampusOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartCampus API")
                        .description("API REST du système d'authentification SmartCampus. " +
                                "Gestion des utilisateurs, des rôles et de la sécurité.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Équipe SmartCampus")
                                .email("contact@smartcampus.ma")))
                // Déclaration du schéma Bearer JWT pour le bouton "Authorize" de Swagger UI
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Entrez votre token JWT (sans le préfixe 'Bearer')")));
    }
}
