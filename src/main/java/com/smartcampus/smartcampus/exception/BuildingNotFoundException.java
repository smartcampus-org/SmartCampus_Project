package com.smartcampus.smartcampus.exception;

public class BuildingNotFoundException extends RuntimeException {
    public BuildingNotFoundException(Long id) {
        super("Bâtiment introuvable avec l'id : " + id);
    }
}
