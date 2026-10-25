package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.AuthResponse;
import com.smartcampus.smartcampus.dto.LoginRequest;
import com.smartcampus.smartcampus.entity.User;
import com.smartcampus.smartcampus.exception.InvalidCredentialsException;
import com.smartcampus.smartcampus.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {

        // Vérifier si l'utilisateur existe
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException();
        }

        // Vérifier si le compte est actif
        if (!user.isEnabled() || user.isLocked()) {
            throw new InvalidCredentialsException();
        }

        // Générer le token JWT
        String token = jwtService.generateToken(user);

        // Retourner les informations de connexion
        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
        );
    }
}
