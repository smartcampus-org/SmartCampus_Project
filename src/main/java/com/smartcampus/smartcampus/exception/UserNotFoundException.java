package com.smartcampus.smartcampus.exception;

/**
 * SC-90 — Utilisateur introuvable.
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String email) {
        super("Utilisateur introuvable");
    }
}
