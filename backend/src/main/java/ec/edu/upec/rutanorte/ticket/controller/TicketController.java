package ec.edu.upec.rutanorte.ticket.controller;

import ec.edu.upec.rutanorte.shared.dto.ApiResponse;
import ec.edu.upec.rutanorte.ticket.dto.TicketResponse;
import ec.edu.upec.rutanorte.ticket.service.TicketService;

import ec.edu.upec.rutanorte.shared.dto.ApiResponse;
import ec.edu.upec.rutanorte.ticket.dto.TicketResponse;
import ec.edu.upec.rutanorte.ticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Boletos", description = "Consulta de boletos emitidos y c�digos QR")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener boleto por ID")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable UUID id) {
        TicketResponse response = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success("Boleto recuperado exitosamente.", response));
    }
}
