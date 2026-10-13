package ec.edu.upec.rutanorte.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ValidateBoardingResponse {

    private boolean valid;
    private String message;
    private UUID ticketId;
    private String passengerName;
    private String seatNumber;
    private String routeName;
    private OffsetDateTime boardedAt;

    public ValidateBoardingResponse() {}

    public ValidateBoardingResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public static ValidateBoardingResponse success(UUID ticketId, String passengerName, String seatNumber, String routeName, OffsetDateTime boardedAt) {
        ValidateBoardingResponse res = new ValidateBoardingResponse(true, "Embarque validado correctamente");
        res.ticketId = ticketId;
        res.passengerName = passengerName;
        res.seatNumber = seatNumber;
        res.routeName = routeName;
        res.boardedAt = boardedAt;
        return res;
    }

    public static ValidateBoardingResponse invalid(String message) {
        return new ValidateBoardingResponse(false, message);
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UUID getTicketId() { return ticketId; }
    public void setTicketId(UUID ticketId) { this.ticketId = ticketId; }

    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public OffsetDateTime getBoardedAt() { return boardedAt; }
    public void setBoardedAt(OffsetDateTime boardedAt) { this.boardedAt = boardedAt; }
}
