package ec.edu.upec.rutanorte.ticket.entity;

import ec.edu.upec.rutanorte.auth.entity.Profile;
import ec.edu.upec.rutanorte.booking.entity.Booking;
import ec.edu.upec.rutanorte.fleet.entity.BusSeat;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_seat_id", nullable = false)
    private BusSeat busSeat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    private Profile passenger;

    @Column(name = "qr_code", nullable = false, unique = true)
    private String qrCode;

    @Column(name = "status", nullable = false)
    private String status = "issued";

    @Column(name = "issued_at", nullable = false)
    private OffsetDateTime issuedAt = OffsetDateTime.now();

    @Column(name = "boarded_at")
    private OffsetDateTime boardedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarded_by")
    private Profile boardedBy;

    public Ticket() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public BusSeat getBusSeat() { return busSeat; }
    public void setBusSeat(BusSeat busSeat) { this.busSeat = busSeat; }

    public Profile getPassenger() { return passenger; }
    public void setPassenger(Profile passenger) { this.passenger = passenger; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(OffsetDateTime issuedAt) { this.issuedAt = issuedAt; }

    public OffsetDateTime getBoardedAt() { return boardedAt; }
    public void setBoardedAt(OffsetDateTime boardedAt) { this.boardedAt = boardedAt; }

    public Profile getBoardedBy() { return boardedBy; }
    public void setBoardedBy(Profile boardedBy) { this.boardedBy = boardedBy; }
}
