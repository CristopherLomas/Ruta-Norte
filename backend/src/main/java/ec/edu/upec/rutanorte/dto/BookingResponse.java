package ec.edu.upec.rutanorte.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class BookingResponse {

    private UUID bookingId;
    private UUID tripId;
    private String status;
    private OffsetDateTime expiresAt;
    private BigDecimal totalAmount;
    private List<String> seatNumbers;

    public BookingResponse() {}

    public BookingResponse(UUID bookingId, UUID tripId, String status, OffsetDateTime expiresAt, BigDecimal totalAmount, List<String> seatNumbers) {
        this.bookingId = bookingId;
        this.tripId = tripId;
        this.status = status;
        this.expiresAt = expiresAt;
        this.totalAmount = totalAmount;
        this.seatNumbers = seatNumbers;
    }

    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
}
