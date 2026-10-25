package com.smartcampus.smartcampus.exception;

/**
 * SC-86 — L'e-mail est déjà associé à un compte existant.
 */
public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException() {
        super("Cet e-mail est déjà utilisé");
    }
}
