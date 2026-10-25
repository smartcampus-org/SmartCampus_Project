package com.smartcampus.smartcampus.exception;

/**
 * SC-87 — Le rôle demandé lors de l'inscription n'existe pas.
 */
public class RoleNotFoundException extends RuntimeException {

    public RoleNotFoundException(String roleName) {
        super("Rôle inconnu : " + roleName);
    }
}
