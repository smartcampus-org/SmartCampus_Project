package com.smartcampus.smartcampus.exception;

/**
 * SC-13 — Compte verrouillé après 3 échecs de connexion.
 */
public class AccountLockedException extends RuntimeException {

    public AccountLockedException() {
        super("Votre compte a été verrouillé après plusieurs tentatives incorrectes. "
                + "Veuillez réinitialiser votre mot de passe.");
    }
}
