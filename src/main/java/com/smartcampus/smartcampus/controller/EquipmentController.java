package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.dto.EquipmentRequest;
import com.smartcampus.smartcampus.dto.EquipmentResponse;
import com.smartcampus.smartcampus.service.EquipmentService;

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
 * BACKEND 4 — Gestion des équipements d'une salle.
 * BACKEND 7 — Sécurisé par JWT ; mutations réservées aux rôles ADMIN / PERSONNEL.
 * TECH 1   — Documentation OpenAPI/Swagger.
 */
@RestController
@RequestMapping("/api/rooms/{roomId}/equipments")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Équipements", description = "Gestion des équipements associés à une salle")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    // -------------------------------------------------------------------------
    // Consultation
    // -------------------------------------------------------------------------

    @Operation(summary = "Lister les équipements d'une salle")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liste retournée"),
            @ApiResponse(responseCode = "404", description = "Salle introuvable")
    })
    @GetMapping
    public ResponseEntity<List<EquipmentResponse>> findByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(equipmentService.findByRoom(roomId));
    }

    @Operation(summary = "Détail d'un équipement")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Équipement trouvé"),
            @ApiResponse(responseCode = "404", description = "Équipement ou salle introuvable")
    })
    @GetMapping("/{equipmentId}")
    public ResponseEntity<EquipmentResponse> findById(
            @PathVariable Long roomId,
            @PathVariable Long equipmentId) {
        return ResponseEntity.ok(equipmentService.findById(roomId, equipmentId));
    }

    // -------------------------------------------------------------------------
    // Création
    // -------------------------------------------------------------------------

    @Operation(summary = "Ajouter un équipement à une salle")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Équipement ajouté"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Salle introuvable")
    })
    @PostMapping
    public ResponseEntity<EquipmentResponse> create(
            @PathVariable Long roomId,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(equipmentService.create(roomId, request));
    }

    // -------------------------------------------------------------------------
    // Modification
    // -------------------------------------------------------------------------

    @Operation(summary = "Modifier un équipement")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Équipement mis à jour"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Équipement ou salle introuvable")
    })
    @PutMapping("/{equipmentId}")
    public ResponseEntity<EquipmentResponse> update(
            @PathVariable Long roomId,
            @PathVariable Long equipmentId,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(equipmentService.update(roomId, equipmentId, request));
    }

    // -------------------------------------------------------------------------
    // Suppression
    // -------------------------------------------------------------------------

    @Operation(summary = "Supprimer un équipement")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Équipement supprimé"),
            @ApiResponse(responseCode = "404", description = "Équipement ou salle introuvable")
    })
    @DeleteMapping("/{equipmentId}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long roomId,
            @PathVariable Long equipmentId) {
        equipmentService.delete(roomId, equipmentId);
        return ResponseEntity.ok(Map.of("message", "Équipement supprimé avec succès"));
    }
}
