package ec.edu.upec.rutanorte.fleet.controller;

import ec.edu.upec.rutanorte.fleet.dto.BusDto;
import ec.edu.upec.rutanorte.fleet.service.FleetService;
import ec.edu.upec.rutanorte.shared.dto.ApiResponse;

import ec.edu.upec.rutanorte.fleet.dto.BusDto;
import ec.edu.upec.rutanorte.fleet.service.FleetService;
import ec.edu.upec.rutanorte.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fleet")
@Tag(name = "Flota", description = "Gesti�n de unidades vehiculares, cooperativas y asientos")
public class FleetController {

    private final FleetService fleetService;

    public FleetController(FleetService fleetService) {
        this.fleetService = fleetService;
    }

    @GetMapping("/buses")
    @Operation(summary = "Listar unidades activas de la flota")
    public ResponseEntity<ApiResponse<List<BusDto>>> getAllBuses() {
        return ResponseEntity.ok(ApiResponse.success("Flota vehicular recuperada.", fleetService.getAllActiveBuses()));
    }

    @GetMapping("/buses/{id}")
    @Operation(summary = "Obtener detalles de una unidad vehicular")
    public ResponseEntity<ApiResponse<BusDto>> getBusById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Unidad encontrada.", fleetService.getBusById(id)));
    }
}
