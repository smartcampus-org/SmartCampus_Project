package com.smartcampus.auth;

import java.util.logging.Logger;

public class LoginService {

    private static final Logger LOGGER = Logger.getLogger(LoginService.class.getName());
    private static final int MIN_PASSWORD_LENGTH = 6;

    public boolean validate(String username, String password) {
        if (username == null || password == null) {
            return false;
        }
        return !username.isEmpty() && password.length() >= MIN_PASSWORD_LENGTH;
    }

    public void logout(String username) {
        LOGGER.info("Utilisateur déconnecté : " + username);
    }
}