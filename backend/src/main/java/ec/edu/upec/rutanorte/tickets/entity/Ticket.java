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

    @Column(name = "seat_number", nullable = false)
    private int seatNumber;

    @Column(name = "qr_token", nullable = false, unique = true, length = 30)
    private String qrToken;

    @Column(nullable = false, length = 20)
    private String status = "PAID"; // PAID or BOARDED

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
