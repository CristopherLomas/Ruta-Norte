package ec.edu.upec.rutanorte.controller;

import ec.edu.upec.rutanorte.dto.ApiResponse;
import ec.edu.upec.rutanorte.dto.PaymentRequest;
import ec.edu.upec.rutanorte.dto.PaymentResponse;
import ec.edu.upec.rutanorte.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Pagos & Boletos", description = "Cobro simulado de reservas y emisión de boletos con código QR")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Confirmar pago simulado y generar boletos electrónicos")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Pago procesado con éxito y boletos emitidos", response));
    }
}
