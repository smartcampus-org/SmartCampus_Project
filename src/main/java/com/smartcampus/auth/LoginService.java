package com.smartcampus.auth;

public class LoginService {

    public boolean validate(String username, String password) {
        if (username == null || password == null) {
            return false;
        }
        return !username.isEmpty() && !password.isEmpty();
    }
}