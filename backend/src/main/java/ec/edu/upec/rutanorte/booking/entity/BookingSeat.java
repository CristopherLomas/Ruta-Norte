package ec.edu.upec.rutanorte.booking.entity;

import ec.edu.upec.rutanorte.fleet.entity.BusSeat;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "booking_seats")
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_seat_id", nullable = false)
    private BusSeat busSeat;

    @Column(name = "status", nullable = false)
    private String status = "reserved";

    public BookingSeat() {}

    public BookingSeat(Booking booking, BusSeat busSeat, String status) {
        this.booking = booking;
        this.busSeat = busSeat;
        this.status = status;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public BusSeat getBusSeat() { return busSeat; }
    public void setBusSeat(BusSeat busSeat) { this.busSeat = busSeat; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
