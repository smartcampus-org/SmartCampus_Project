package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.dto.BuildingRequest;
import com.smartcampus.smartcampus.dto.BuildingResponse;
import com.smartcampus.smartcampus.entity.Building;
import com.smartcampus.smartcampus.exception.BuildingNameAlreadyExistsException;
import com.smartcampus.smartcampus.exception.BuildingNotFoundException;
import com.smartcampus.smartcampus.repository.BuildingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * BACKEND 1 / BACKEND 3 — Gestion des bâtiments du campus.
 */
@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }

    // -------------------------------------------------------------------------
    // BACKEND 2 — Consultation
    // -------------------------------------------------------------------------

    public List<BuildingResponse> findAll() {
        return buildingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BuildingResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    // -------------------------------------------------------------------------
    // BACKEND 3 — Création
    // -------------------------------------------------------------------------

    @Transactional
    public BuildingResponse create(BuildingRequest request) {
        if (buildingRepository.existsByName(request.name())) {
            throw new BuildingNameAlreadyExistsException(request.name());
        }
        Building building = new Building();
        building.setName(request.name());
        building.setAddress(request.address());
        building.setFloors(request.floors());
        return toResponse(buildingRepository.save(building));
    }

    // -------------------------------------------------------------------------
    // BACKEND 3 — Modification
    // -------------------------------------------------------------------------

    @Transactional
    public BuildingResponse update(Long id, BuildingRequest request) {
        Building building = getOrThrow(id);

        // Vérifie l'unicité du nom uniquement si le nom change
        if (!building.getName().equals(request.name())
                && buildingRepository.existsByName(request.name())) {
            throw new BuildingNameAlreadyExistsException(request.name());
        }

        building.setName(request.name());
        building.setAddress(request.address());
        building.setFloors(request.floors());
        return toResponse(buildingRepository.save(building));
    }

    // -------------------------------------------------------------------------
    // BACKEND 3 — Suppression
    // -------------------------------------------------------------------------

    @Transactional
    public void delete(Long id) {
        getOrThrow(id);
        buildingRepository.deleteById(id);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public Building getOrThrow(Long id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new BuildingNotFoundException(id));
    }

    public BuildingResponse toResponse(Building b) {
        return new BuildingResponse(
                b.getId(),
                b.getName(),
                b.getAddress(),
                b.getFloors(),
                b.getRooms().size()
        );
    }
}
