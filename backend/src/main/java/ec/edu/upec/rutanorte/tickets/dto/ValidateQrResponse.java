package ec.edu.upec.rutanorte.tickets.dto;

public class ValidateQrResponse {

    private boolean valid;
    private String message;
    private Integer seatNumber;
    private String passengerName;
    private String origin;
    private String destination;
    private String departureTime;
    private String status;

    public ValidateQrResponse() {}

    public static ValidateQrResponse success(String message, Integer seatNumber, String passengerName, String origin, String destination, String departureTime) {
        ValidateQrResponse resp = new ValidateQrResponse();
        resp.valid = true;
        resp.message = message;
        resp.seatNumber = seatNumber;
        resp.passengerName = passengerName;
        resp.origin = origin;
        resp.destination = destination;
        resp.departureTime = departureTime;
        resp.status = "BOARDED";
        return resp;
    }

    public static ValidateQrResponse error(String message, String currentStatus) {
        ValidateQrResponse resp = new ValidateQrResponse();
        resp.valid = false;
        resp.message = message;
        resp.status = currentStatus;
        return resp;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
