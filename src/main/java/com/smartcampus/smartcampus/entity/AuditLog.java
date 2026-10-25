package com.smartcampus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * SC-94 — Journal d'audit des événements de sécurité.
 * Enregistre chaque tentative de connexion, déconnexion, inscription, etc.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_email", columnList = "email"),
        @Index(name = "idx_audit_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Type d'événement : LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, REGISTER, etc. */
    @Column(nullable = false, length = 50)
    private String eventType;

    /** E-mail concerné (peut être null si non applicable) */
    @Column(length = 150)
    private String email;

    /** Adresse IP de la requête */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /** Message descriptif (ex: "Compte verrouillé après 3 échecs") */
    @Column(length = 255)
    private String details;

    /** Résultat : SUCCESS ou FAILURE */
    @Column(nullable = false, length = 10)
    private String outcome;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Types d'événements (constantes)
    public static final String LOGIN_SUCCESS    = "LOGIN_SUCCESS";
    public static final String LOGIN_FAILURE    = "LOGIN_FAILURE";
    public static final String ACCOUNT_LOCKED   = "ACCOUNT_LOCKED";
    public static final String LOGOUT           = "LOGOUT";
    public static final String REGISTER         = "REGISTER";
    public static final String PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST";
    public static final String PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS";
    public static final String PASSWORD_CHANGE  = "PASSWORD_CHANGE";

    public static final String SUCCESS = "SUCCESS";
    public static final String FAILURE = "FAILURE";
}
