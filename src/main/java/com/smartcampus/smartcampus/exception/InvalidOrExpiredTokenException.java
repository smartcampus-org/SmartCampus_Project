package com.smartcampus.smartcampus.exception;

/**
 * SC-88 — Token de réinitialisation invalide, expiré ou déjà utilisé.
 */
public class InvalidOrExpiredTokenException extends RuntimeException {

    public InvalidOrExpiredTokenException() {
        super("Le lien de réinitialisation est invalide ou a expiré");
    }
}
