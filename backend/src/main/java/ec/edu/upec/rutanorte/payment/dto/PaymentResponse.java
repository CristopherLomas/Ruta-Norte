package ec.edu.upec.rutanorte.payment.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PaymentResponse {

    private UUID paymentId;
    private UUID bookingId;
    private String status;
    private BigDecimal amount;
    private String reference;
    private List<TicketDto> tickets;

    public static class TicketDto {
        private UUID ticketId;
        private String seatNumber;
        private String qrCode;

        public TicketDto() {}

        public TicketDto(UUID ticketId, String seatNumber, String qrCode) {
            this.ticketId = ticketId;
            this.seatNumber = seatNumber;
            this.qrCode = qrCode;
        }

        public UUID getTicketId() { return ticketId; }
        public void setTicketId(UUID ticketId) { this.ticketId = ticketId; }

        public String getSeatNumber() { return seatNumber; }
        public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

        public String getQrCode() { return qrCode; }
        public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    }

    public PaymentResponse() {}

    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }

    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public List<TicketDto> getTickets() { return tickets; }
    public void setTickets(List<TicketDto> tickets) { this.tickets = tickets; }
}
