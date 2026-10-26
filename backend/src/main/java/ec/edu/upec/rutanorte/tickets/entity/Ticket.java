package ec.edu.upec.rutanorte.tickets.entity;

import ec.edu.upec.rutanorte.trips.entity.Trip;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tickets",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_trip_seat", columnNames = {"trip_id", "seat_number"}),
        @UniqueConstraint(name = "uk_qr_token", columnNames = {"qr_token"})
    }
)
public class Ticket {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "passenger_name", nullable = false, length = 100)
    private String passengerName = "Pasajero General";

    @Column(name = "passenger_dni", length = 20)
    private String passengerDni = "1004567890";

    @Column(name = "seat_number", nullable = false)
    private int seatNumber;

    @Column(name = "qr_token", nullable = false, unique = true, length = 30)
    private String qrToken;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod = "TRANSFERENCIA";

    @Column(name = "payment_reference", length = 80)
    private String paymentReference;

    @Column(name = "bank_name", length = 60)
    private String bankName;

    @Column(nullable = false, length = 25)
    private String status = "PENDING_VERIFICATION"; // PENDING_VERIFICATION, PAID, REJECTED, BOARDED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "boarded_at")
    private LocalDateTime boardedAt;

    public Ticket() {}

    public Ticket(Trip trip, String passengerName, int seatNumber, String qrToken, String status) {
        this.trip = trip;
        this.passengerName = passengerName != null && !passengerName.isBlank() ? passengerName : "Pasajero General";
        this.seatNumber = seatNumber;
        this.qrToken = qrToken;
        this.status = status != null ? status : "PAID";
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
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

    public int getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(int seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getBoardedAt() {
        return boardedAt;
    }

    public void setBoardedAt(LocalDateTime boardedAt) {
        this.boardedAt = boardedAt;
    }
}
