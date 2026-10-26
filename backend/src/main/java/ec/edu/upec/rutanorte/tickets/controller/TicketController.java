package ec.edu.upec.rutanorte.tickets.controller;

import ec.edu.upec.rutanorte.tickets.dto.PurchaseTicketRequest;
import ec.edu.upec.rutanorte.tickets.dto.TicketResponse;
import ec.edu.upec.rutanorte.tickets.dto.ValidateQrRequest;
import ec.edu.upec.rutanorte.tickets.dto.ValidateQrResponse;
import ec.edu.upec.rutanorte.tickets.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/purchase")
    public ResponseEntity<List<TicketResponse>> purchaseTickets(@RequestBody PurchaseTicketRequest request) {
        List<TicketResponse> tickets = ticketService.purchaseTickets(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tickets);
    }

    @PostMapping("/validate-qr")
    public ResponseEntity<ValidateQrResponse> validateQr(@RequestBody ValidateQrRequest request) {
        ValidateQrResponse response = ticketService.validateQr(request.getQrToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TicketResponse>> getRecentTickets() {
        return ResponseEntity.ok(ticketService.getRecentTickets());
    }

    @GetMapping("/pending-verification")
    public ResponseEntity<List<TicketResponse>> getPendingVerificationTickets() {
        return ResponseEntity.ok(ticketService.getPendingVerificationTickets());
    }

    @PostMapping("/{id}/verify-payment")
    public ResponseEntity<TicketResponse> verifyPayment(
            @PathVariable UUID id,
            @RequestBody(required = false) java.util.Map<String, String> payload) {
        String action = (payload != null && payload.containsKey("action")) ? payload.get("action") : "APPROVE";
        TicketResponse response = ticketService.verifyPayment(id, action);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }
}
