package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.dto.BuildingRequest;
import com.smartcampus.smartcampus.dto.BuildingResponse;
import com.smartcampus.smartcampus.service.BuildingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BACKEND 2 — Consultation des bâtiments.
 * BACKEND 3 — Création / modification / suppression des bâtiments.
 * BACKEND 7 — Sécurisé : lecture pour ADMIN/PERSONNEL/PROFESSEUR/ETUDIANT,
 *             écriture réservée à l'ADMIN.
 * TECH 1   — Documentation OpenAPI/Swagger.
 */
@RestController
@RequestMapping("/api/buildings")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Bâtiments", description = "Gestion des bâtiments du campus")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    // -------------------------------------------------------------------------
    // BACKEND 2 — Consultation
    // -------------------------------------------------------------------------

    @Operation(summary = "Lister tous les bâtiments")
    @ApiResponse(responseCode = "200", description = "Liste retournée")
    @GetMapping
    public ResponseEntity<List<BuildingResponse>> findAll() {
        return ResponseEntity.ok(buildingService.findAll());
    }

    @Operation(summary = "Détail d'un bâtiment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bâtiment trouvé"),
            @ApiResponse(responseCode = "404", description = "Bâtiment introuvable")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(buildingService.findById(id));
    }

    // -------------------------------------------------------------------------
    // BACKEND 3 — ADMIN uniquement
    // -------------------------------------------------------------------------

    @Operation(summary = "Créer un bâtiment")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Bâtiment créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "409", description = "Nom déjà utilisé")
    })
    @PostMapping
    public ResponseEntity<BuildingResponse> create(@Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(buildingService.create(request));
    }

    @Operation(summary = "Modifier un bâtiment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bâtiment mis à jour"),
            @ApiResponse(responseCode = "404", description = "Bâtiment introuvable"),
            @ApiResponse(responseCode = "409", description = "Nom déjà utilisé")
    })
    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.update(id, request));
    }

    @Operation(summary = "Supprimer un bâtiment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bâtiment supprimé"),
            @ApiResponse(responseCode = "404", description = "Bâtiment introuvable")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        buildingService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Bâtiment supprimé avec succès"));
    }
}
