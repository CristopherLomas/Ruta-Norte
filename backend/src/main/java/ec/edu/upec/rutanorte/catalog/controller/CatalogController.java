package ec.edu.upec.rutanorte.catalog.controller;

import ec.edu.upec.rutanorte.catalog.entity.Bus;
import ec.edu.upec.rutanorte.catalog.entity.City;
import ec.edu.upec.rutanorte.catalog.service.CatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/cities")
    public ResponseEntity<List<City>> getCities() {
        return ResponseEntity.ok(catalogService.getAllCities());
    }

    @GetMapping("/buses")
    public ResponseEntity<List<Bus>> getBuses() {
        return ResponseEntity.ok(catalogService.getAllBuses());
    }

    @PostMapping("/buses")
    public ResponseEntity<Bus> createBus(@RequestBody Bus bus) {
        Bus created = catalogService.createBus(bus);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
