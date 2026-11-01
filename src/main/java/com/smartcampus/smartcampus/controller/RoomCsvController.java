package com.smartcampus.smartcampus.controller;

import com.smartcampus.smartcampus.entity.Equipment;
import com.smartcampus.smartcampus.entity.Room;
import com.smartcampus.smartcampus.service.RoomService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * BACKEND 6 — Export CSV du catalogue des salles.
 * BACKEND 7 — Sécurisé par JWT.
 * TECH 1   — Documentation OpenAPI/Swagger.
 * <p>
 * GET /api/rooms/export → télécharge un fichier CSV avec toutes les salles
 * et leurs équipements.
 */
@RestController
@RequestMapping("/api/rooms")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Export", description = "Export CSV du catalogue des salles")
public class RoomCsvController {

    private static final String CSV_SEPARATOR = ";";
    private static final String CHARSET       = "UTF-8";

    private final RoomService roomService;

    public RoomCsvController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Génère et envoie un fichier CSV contenant l'ensemble des salles
     * avec leurs équipements.
     * <p>
     * Colonnes :
     * ID; Numéro; Nom; Bâtiment; Étage; Capacité; Type; Statut; Description; Équipements
     */
    @Operation(
        summary = "Exporter les salles en CSV",
        description = "Télécharge un fichier CSV avec toutes les salles et leurs équipements."
    )
    @ApiResponse(responseCode = "200", description = "Fichier CSV généré")
    @GetMapping(value = "/export", produces = "text/csv")
    public void exportCsv(HttpServletResponse response, Authentication authentication)
            throws IOException {

        response.setContentType("text/csv; charset=" + CHARSET);
        response.setHeader("Content-Disposition",
                "attachment; filename=\"smartcampus_rooms.csv\"");

        // SC-21 — Les salles FERMEE sont exclues pour les étudiants
        String role = authentication != null
                ? authentication.getAuthorities().stream().findFirst()
                        .map(a -> a.getAuthority()).orElse("")
                : "";
        List<Room> rooms = roomService.findAllForExport(role);

        try (PrintWriter writer = response.getWriter()) {

            // En-tête BOM UTF-8 pour compatibilité Excel
            writer.write('\uFEFF');

            // Ligne d'en-tête
            writer.println(String.join(CSV_SEPARATOR,
                    "ID",
                    "Numéro",
                    "Nom",
                    "Bâtiment",
                    "Étage",
                    "Capacité",
                    "Type",
                    "Statut",
                    "Description",
                    "Équipements"
            ));

            for (Room room : rooms) {
                String equipmentsSummary = room.getEquipments()
                        .stream()
                        .map(e -> formatEquipment(e))
                        .collect(Collectors.joining(" | "));

                writer.println(String.join(CSV_SEPARATOR,
                        safe(room.getId()),
                        safe(room.getRoomNumber()),
                        safe(room.getName()),
                        safe(room.getBuilding() != null ? room.getBuilding().getName() : ""),
                        safe(room.getFloor()),
                        safe(room.getCapacity()),
                        safe(room.getType()),
                        safe(room.getStatus()),
                        safe(room.getDescription()),
                        escapeCsv(equipmentsSummary)
                ));
            }
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String formatEquipment(Equipment e) {
        return e.getName() + " (x" + e.getQuantity() + ", "
                + (e.isFunctional() ? "OK" : "HS") + ")";
    }

    /** Convertit une valeur en chaîne sûre pour CSV (null → ""). */
    private String safe(Object value) {
        if (value == null) return "";
        return escapeCsv(value.toString());
    }

    /** Échappe les guillemets et encadre de guillemets si nécessaire. */
    private String escapeCsv(String value) {
        if (value == null || value.isEmpty()) return "";
        // Si la valeur contient le séparateur, des guillemets ou des sauts de ligne
        if (value.contains(CSV_SEPARATOR) || value.contains("\"")
                || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
