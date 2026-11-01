package com.smartcampus.smartcampus.exception;

public class EquipmentNotFoundException extends RuntimeException {
    public EquipmentNotFoundException(Long id) {
        super("Équipement introuvable avec l'id : " + id);
    }
}
