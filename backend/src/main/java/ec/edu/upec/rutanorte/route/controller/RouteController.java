package ec.edu.upec.rutanorte.route.controller;

import ec.edu.upec.rutanorte.route.dto.RouteDto;
import ec.edu.upec.rutanorte.route.service.RouteService;
import ec.edu.upec.rutanorte.shared.dto.ApiResponse;

import ec.edu.upec.rutanorte.route.dto.RouteDto;
import ec.edu.upec.rutanorte.route.service.RouteService;
import ec.edu.upec.rutanorte.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/routes")
@Tag(name = "Rutas", description = "Gesti�n y cat�logo de rutas y corredores interparroquiales")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las rutas activas")
    public ResponseEntity<ApiResponse<List<RouteDto>>> getAllRoutes() {
        return ResponseEntity.ok(ApiResponse.success("Cat�logo de rutas recuperado.", routeService.getAllActiveRoutes()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalles de una ruta")
    public ResponseEntity<ApiResponse<RouteDto>> getRouteById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Ruta encontrada.", routeService.getRouteById(id)));
    }
}
