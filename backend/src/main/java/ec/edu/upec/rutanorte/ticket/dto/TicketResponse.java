package ec.edu.upec.rutanorte.ticket.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TicketResponse {
    private UUID ticketId;
    private UUID bookingId;
    private String seatNumber;
    private String passengerName;
    private String qrCode;
    private String status;
    private OffsetDateTime issuedAt;
    private OffsetDateTime boardedAt;

    public TicketResponse() {}

    public TicketResponse(UUID ticketId, UUID bookingId, String seatNumber, String passengerName, String qrCode, String status, OffsetDateTime issuedAt, OffsetDateTime boardedAt) {
        this.ticketId = ticketId;
        this.bookingId = bookingId;
        this.seatNumber = seatNumber;
        this.passengerName = passengerName;
        this.qrCode = qrCode;
        this.status = status;
        this.issuedAt = issuedAt;
        this.boardedAt = boardedAt;
    }

    public UUID getTicketId() { return ticketId; }
    public void setTicketId(UUID ticketId) { this.ticketId = ticketId; }
    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(OffsetDateTime issuedAt) { this.issuedAt = issuedAt; }
    public OffsetDateTime getBoardedAt() { return boardedAt; }
    public void setBoardedAt(OffsetDateTime boardedAt) { this.boardedAt = boardedAt; }
}
