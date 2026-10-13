package ec.edu.upec.rutanorte.controller;

import ec.edu.upec.rutanorte.dto.ApiResponse;
import ec.edu.upec.rutanorte.dto.BookingRequest;
import ec.edu.upec.rutanorte.dto.BookingResponse;
import ec.edu.upec.rutanorte.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Reservas", description = "Reserva atómica temporal de asientos y cancelación")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Crear reserva temporal de asientos con expiración a 10 min")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reserva creada exitosamente. Dispone de 10 minutos para pagar.", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar reserva voluntariamente y liberar asientos")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable UUID id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Reserva cancelada correctamente y asientos liberados.", null));
    }
}
