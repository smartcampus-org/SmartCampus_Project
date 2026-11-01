package com.smartcampus.smartcampus.exception;

public class BuildingNameAlreadyExistsException extends RuntimeException {
    public BuildingNameAlreadyExistsException(String name) {
        super("Un bâtiment portant le nom « " + name + " » existe déjà");
    }
}
