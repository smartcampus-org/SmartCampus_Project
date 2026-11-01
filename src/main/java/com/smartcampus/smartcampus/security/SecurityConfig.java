package com.smartcampus.smartcampus.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // ── Routes publiques ──────────────────────────────────────────
                .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/logout",
                        "/api/auth/register",
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/api-docs/**",
                        "/v3/api-docs/**"
                ).permitAll()

                // ── Accès par rôle — routes legacy ────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/etudiant/**").hasRole("ETUDIANT")
                .requestMatchers("/api/personnel/**").hasRole("PERSONNEL")

                // ── BACKEND 7 — Nouvelles routes ──────────────────────────────
                // Règle : les mutations (POST/PUT/PATCH/DELETE) sont restreintes
                //         aux rôles ADMIN et PERSONNEL.
                //         La lecture (GET) est ouverte à tout utilisateur authentifié.
                //
                // IMPORTANT : Spring Security évalue les règles dans l'ordre.
                // Les règles sur des méthodes HTTP spécifiques sont déclarées en
                // premier ; la règle GET générale vient ensuite et couvre tout le
                // reste (liste, détail, recherche, historique, export).

                // Équipements — mutations
                .requestMatchers(HttpMethod.POST,   "/api/rooms/*/equipments")      .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.PUT,    "/api/rooms/*/equipments/**")   .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/*/equipments/**")   .hasAnyRole("ADMIN", "PERSONNEL")

                // Salles — mutations
                .requestMatchers(HttpMethod.POST,   "/api/rooms")                   .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.PUT,    "/api/rooms/**")                .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.PATCH,  "/api/rooms/**")                .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**")                .hasAnyRole("ADMIN", "PERSONNEL")

                // Bâtiments — mutations
                .requestMatchers(HttpMethod.POST,   "/api/buildings")               .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.PUT,    "/api/buildings/**")            .hasAnyRole("ADMIN", "PERSONNEL")
                .requestMatchers(HttpMethod.DELETE, "/api/buildings/**")            .hasAnyRole("ADMIN", "PERSONNEL")

                // Lecture — tous les utilisateurs authentifiés
                // Cette règle couvre : GET /api/rooms, /api/rooms/search,
                // /api/rooms/{id}, /api/rooms/{id}/status-history,
                // /api/rooms/export, /api/buildings, /api/buildings/{id}
                .requestMatchers(HttpMethod.GET, "/api/rooms/**", "/api/rooms",
                                                 "/api/buildings/**", "/api/buildings")
                                                 .authenticated()

                // Toute autre route nécessite une authentification
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
