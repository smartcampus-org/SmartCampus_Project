package com.smartcampus.smartcampus.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

                    // Routes publiques — aucune authentification requise
                    .requestMatchers(
                            "/api/auth/login",
                            "/api/auth/logout",
                            "/api/auth/register",           // SC-86
                            "/api/auth/forgot-password",    // SC-88
                            "/api/auth/reset-password",     // SC-88
                            "/swagger-ui.html",             // SC-100
                            "/swagger-ui/**",               // SC-100
                            "/api-docs/**",                 // SC-100
                            "/v3/api-docs/**"               // SC-100
                    ).permitAll()

                    // SC-87 — Accès selon le rôle
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/etudiant/**").hasRole("ETUDIANT")
                    .requestMatchers("/api/personnel/**").hasRole("PERSONNEL")

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
