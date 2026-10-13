package ec.edu.upec.rutanorte.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "bus_seats")
public class BusSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(name = "seat_row", nullable = false)
    private Integer seatRow;

    @Column(name = "seat_column", nullable = false)
    private Integer seatColumn;

    @Column(name = "seat_type", nullable = false)
    private String seatType = "standard";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public BusSeat() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public Integer getSeatRow() { return seatRow; }
    public void setSeatRow(Integer seatRow) { this.seatRow = seatRow; }

    public Integer getSeatColumn() { return seatColumn; }
    public void setSeatColumn(Integer seatColumn) { this.seatColumn = seatColumn; }

    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
