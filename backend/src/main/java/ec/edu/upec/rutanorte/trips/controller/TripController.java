package ec.edu.upec.rutanorte.trips.controller;

import ec.edu.upec.rutanorte.trips.dto.CreateTripRequest;
import ec.edu.upec.rutanorte.trips.dto.SeatStatusDto;
import ec.edu.upec.rutanorte.trips.dto.TripSearchResponse;
import ec.edu.upec.rutanorte.trips.entity.Trip;
import ec.edu.upec.rutanorte.trips.service.TripService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<TripSearchResponse>> searchTrips(
        @RequestParam(required = false) Integer originId,
        @RequestParam(required = false) Integer destinationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) String shift
    ) {
        List<TripSearchResponse> results = tripService.searchTrips(originId, destinationId, date, shift);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{tripId}/seats")
    public ResponseEntity<List<SeatStatusDto>> getTripSeats(@PathVariable UUID tripId) {
        List<SeatStatusDto> seats = tripService.getTripSeats(tripId);
        return ResponseEntity.ok(seats);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripSearchResponse> getTripById(@PathVariable UUID tripId) {
        Trip trip = tripService.getTripById(tripId);
        return ResponseEntity.ok(tripService.mapToResponse(trip));
    }

    @PostMapping
    public ResponseEntity<TripSearchResponse> createTrip(@RequestBody CreateTripRequest request) {
        Trip created = tripService.createTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.mapToResponse(created));
    }
}
