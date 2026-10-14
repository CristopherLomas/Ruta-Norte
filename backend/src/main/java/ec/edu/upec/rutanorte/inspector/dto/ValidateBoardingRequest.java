package ec.edu.upec.rutanorte.inspector.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class ValidateBoardingRequest {

    @NotBlank(message = "El payload del código QR es requerido")
    private String qrPayload;

    private UUID inspectorId;

    public ValidateBoardingRequest() {}

    public ValidateBoardingRequest(String qrPayload, UUID inspectorId) {
        this.qrPayload = qrPayload;
        this.inspectorId = inspectorId;
    }

    public String getQrPayload() { return qrPayload; }
    public void setQrPayload(String qrPayload) { this.qrPayload = qrPayload; }

    public UUID getInspectorId() { return inspectorId; }
    public void setInspectorId(UUID inspectorId) { this.inspectorId = inspectorId; }
}
