package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.dto.*;
import com.smartcampus.smartcampus.entity.RoomStatus;
import com.smartcampus.smartcampus.entity.RoomType;
import com.smartcampus.smartcampus.service.RoomService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * BACKEND 2 — API de consultation et de recherche des salles.
 * BACKEND 3 — API d'ajout et de modification des salles.
 * BACKEND 5 — Gestion des statuts et historique.
 * BACKEND 7 — Sécurisé par JWT ; mutations réservées aux rôles ADMIN / PERSONNEL.
 * TECH 1   — Documentation OpenAPI/Swagger.
 */
@RestController
@RequestMapping("/api/rooms")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Salles", description = "Catalogue des salles, recherche, statuts et historique")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // =========================================================================
    // BACKEND 2 — Consultation et recherche
    // =========================================================================

    @Operation(summary = "Lister toutes les salles (paginé)")
    @ApiResponse(responseCode = "200", description = "Page retournée")
    @GetMapping
    public ResponseEntity<Page<RoomSummaryResponse>> findAll(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {
        String role = extractRole(authentication);
        return ResponseEntity.ok(roomService.findAll(pageable, role));
    }

    @Operation(summary = "Détail complet d'une salle")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Salle trouvée"),
            @ApiResponse(responseCode = "404", description = "Salle introuvable ou non visible")
    })
    @GetMapping("/{id}")
    public ResponseEntity<RoomDetailResponse> findById(
            @PathVariable Long id,
            Authentication authentication) {
        String role = extractRole(authentication);
        return ResponseEntity.ok(roomService.findById(id, role));
    }

    @Operation(
        summary = "Rechercher des salles",
        description = "Recherche multi-critères avec filtres optionnels et pagination. "
                    + "Tous les paramètres sont optionnels."
    )
    @ApiResponse(responseCode = "200", description = "Résultats de la recherche")
    @GetMapping("/search")
    public ResponseEntity<Page<RoomSummaryResponse>> search(
            @Parameter(description = "Texte libre (numéro, nom, bâtiment)")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "Statut de la salle")
            @RequestParam(required = false) RoomStatus status,

            @Parameter(description = "Type de salle")
            @RequestParam(required = false) RoomType type,

            @Parameter(description = "Identifiant du bâtiment")
            @RequestParam(required = false) Long buildingId,

            @Parameter(description = "Capacité minimale")
            @RequestParam(required = false) Integer minCapacity,

            @ParameterObject @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        String role = extractRole(authentication);
        return ResponseEntity.ok(
                roomService.search(keyword, status, type, buildingId, minCapacity, pageable, role));
    }

    // =========================================================================
    // BACKEND 3 — Création / modification / suppression
    // =========================================================================

    @Operation(summary = "Créer une salle")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Salle créée"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Bâtiment introuvable"),
            @ApiResponse(responseCode = "409", description = "Numéro de salle déjà utilisé dans ce bâtiment")
    })
    @PostMapping
    public ResponseEntity<RoomDetailResponse> create(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomService.create(request));
    }

    @Operation(summary = "Modifier une salle")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Salle mise à jour"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Salle ou bâtiment introuvable"),
            @ApiResponse(responseCode = "409", description = "Numéro de salle déjà utilisé dans ce bâtiment")
    })
    @PutMapping("/{id}")
    public ResponseEntity<RoomDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    @Operation(summary = "Supprimer une salle")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Salle supprimée"),
            @ApiResponse(responseCode = "404", description = "Salle introuvable")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Salle supprimée avec succès"));
    }

    // =========================================================================
    // BACKEND 5 — Gestion des statuts
    // =========================================================================

    @Operation(
        summary = "Changer le statut d'une salle",
        description = "Enregistre le nouveau statut et conserve l'historique du changement."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Statut mis à jour"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Salle introuvable")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<RoomDetailResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusChangeRequest request,
            Authentication authentication) {
        String changedBy = authentication.getName();
        return ResponseEntity.ok(roomService.changeStatus(id, request, changedBy));
    }

    @Operation(
        summary = "Historique des statuts d'une salle",
        description = "Retourne la liste paginée des changements de statut, du plus récent au plus ancien."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Historique retourné"),
            @ApiResponse(responseCode = "404", description = "Salle introuvable")
    })
    @GetMapping("/{id}/status-history")
    public ResponseEntity<Page<StatusHistoryResponse>> getStatusHistory(
            @PathVariable Long id,
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(roomService.getStatusHistory(id, pageable));
    }

    // =========================================================================
    // Helper — extraction du rôle Spring Security
    // =========================================================================

    /**
     * SC-21 — Extrait le premier rôle de l'authentification.
     * Retourne une chaîne vide si l'authentification est nulle.
     */
    private String extractRole(Authentication authentication) {
        if (authentication == null) return "";
        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");
    }
}
