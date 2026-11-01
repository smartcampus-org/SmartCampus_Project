package com.smartcampus.smartcampus.exception;

public class RoomNumberAlreadyExistsException extends RuntimeException {
    public RoomNumberAlreadyExistsException(String roomNumber, String buildingName) {
        super("La salle « " + roomNumber + " » existe déjà dans le bâtiment « " + buildingName + " »");
    }
}
