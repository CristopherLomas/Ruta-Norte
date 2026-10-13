package ec.edu.upec.rutanorte.controller;

import ec.edu.upec.rutanorte.dto.ApiResponse;
import ec.edu.upec.rutanorte.entity.Trip;
import ec.edu.upec.rutanorte.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@Tag(name = "Viajes", description = "Búsqueda pública de horarios y disponibilidad de asientos")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    @Operation(summary = "Buscar viajes programados (opcionalmente filtrados por ruta)")
    public ResponseEntity<ApiResponse<List<Trip>>> searchTrips(@RequestParam(required = false) UUID routeId) {
        List<Trip> trips = tripService.searchTrips(routeId);
        return ResponseEntity.ok(ApiResponse.success(trips));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un viaje específico")
    public ResponseEntity<ApiResponse<Trip>> getTripById(@PathVariable UUID id) {
        Trip trip = tripService.getTripById(id);
        return ResponseEntity.ok(ApiResponse.success(trip));
    }

    @GetMapping("/{id}/seats")
    @Operation(summary = "Obtener mapa gráfico de disponibilidad de asientos de la unidad")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeatAvailability(@PathVariable UUID id) {
        Map<String, Object> availability = tripService.getSeatAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }
}
