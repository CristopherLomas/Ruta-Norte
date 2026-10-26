package ec.edu.upec.rutanorte.tickets.dto;

import java.util.List;
import java.util.UUID;

public class PurchaseTicketRequest {

    private UUID tripId;
    private List<Integer> seatNumbers;
    private String passengerName;
    private String passengerDni;
    private String paymentMethod;
    private String paymentReference;
    private String bankName;

    public PurchaseTicketRequest() {}

    public PurchaseTicketRequest(UUID tripId, List<Integer> seatNumbers, String passengerName) {
        this.tripId = tripId;
        this.seatNumbers = seatNumbers;
        this.passengerName = passengerName;
    }

    public UUID getTripId() {
        return tripId;
    }

    public void setTripId(UUID tripId) {
        this.tripId = tripId;
    }

    public List<Integer> getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(List<Integer> seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public String getPassengerDni() {
        return passengerDni;
    }

    public void setPassengerDni(String passengerDni) {
        this.passengerDni = passengerDni;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
}
