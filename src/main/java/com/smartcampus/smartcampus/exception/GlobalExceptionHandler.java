package com.smartcampus.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// BACKEND 3/4/5 — Exceptions métier des salles

@RestControllerAdvice
public class GlobalExceptionHandler {

    // SC-8 / SC-101 — Identifiants incorrects (message générique)
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(
            InvalidCredentialsException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", ex.getMessage()));
    }

    // SC-13 — Compte verrouillé
    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, String>> handleAccountLocked(
            AccountLockedException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", ex.getMessage()));
    }

    // SC-86 — E-mail déjà utilisé
    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyUsed(
            EmailAlreadyUsedException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    // SC-87 — Rôle introuvable
    @ExceptionHandler(RoleNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRoleNotFound(
            RoleNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    // SC-88 — Token invalide ou expiré
    @ExceptionHandler(InvalidOrExpiredTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidToken(
            InvalidOrExpiredTokenException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    // SC-90 — Utilisateur introuvable
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(
            UserNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    // BACKEND 1/3 — Bâtiment introuvable
    @ExceptionHandler(BuildingNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBuildingNotFound(
            BuildingNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    // BACKEND 1/3 — Nom de bâtiment déjà utilisé
    @ExceptionHandler(BuildingNameAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleBuildingNameExists(
            BuildingNameAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    // BACKEND 2/3 — Salle introuvable
    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRoomNotFound(
            RoomNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    // BACKEND 3 — Numéro de salle déjà utilisé dans le bâtiment
    @ExceptionHandler(RoomNumberAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleRoomNumberExists(
            RoomNumberAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    // BACKEND 4 — Équipement introuvable
    @ExceptionHandler(EquipmentNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEquipmentNotFound(
            EquipmentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    // Validation des champs (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
