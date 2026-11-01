package com.smartcampus.smartcampus.exception;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(Long id) {
        super("Salle introuvable avec l'id : " + id);
    }
}
