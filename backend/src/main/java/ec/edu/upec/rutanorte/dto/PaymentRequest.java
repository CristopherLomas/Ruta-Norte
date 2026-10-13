package ec.edu.upec.rutanorte.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class PaymentRequest {

    @NotNull(message = "El bookingId es requerido")
    private UUID bookingId;

    @NotBlank(message = "El método de pago es requerido (simulated_card, simulated_cash, etc.)")
    private String method;

    @NotNull(message = "El monto es requerido")
    private BigDecimal amount;

    public PaymentRequest() {}

    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
