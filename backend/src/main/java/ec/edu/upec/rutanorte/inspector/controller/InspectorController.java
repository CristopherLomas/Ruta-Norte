package ec.edu.upec.rutanorte.inspector.controller;

import ec.edu.upec.rutanorte.inspector.dto.ValidateBoardingRequest;
import ec.edu.upec.rutanorte.inspector.dto.ValidateBoardingResponse;
import ec.edu.upec.rutanorte.inspector.service.InspectorService;
import ec.edu.upec.rutanorte.shared.dto.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inspector")
@Tag(name = "Control de Andén", description = "Validación de abordaje de boletos mediante código QR")
public class InspectorController {

    private final InspectorService inspectorService;

    public InspectorController(InspectorService inspectorService) {
        this.inspectorService = inspectorService;
    }

    @PostMapping("/validate-ticket")
    @Operation(summary = "Validar boleto mediante token QR y registrar abordaje en tiempo real")
    public ResponseEntity<ApiResponse<ValidateBoardingResponse>> validateTicket(
            @Valid @RequestBody ValidateBoardingRequest request
    ) {
        ValidateBoardingResponse response = inspectorService.validateBoarding(request);
        if (!response.isValid()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(response.getMessage()));
        }
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }
}
