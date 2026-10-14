package ec.edu.upec.rutanorte.trip.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class TripResponse {
    private UUID tripId;
    private String routeName;
    private String busPlate;
    private OffsetDateTime departureTime;
    private OffsetDateTime arrivalTime;
    private String status;
    private Integer availableSeats;
    private BigDecimal price;

    public TripResponse() {}

    public TripResponse(UUID tripId, String routeName, String busPlate, OffsetDateTime departureTime, OffsetDateTime arrivalTime, String status, Integer availableSeats, BigDecimal price) {
        this.tripId = tripId;
        this.routeName = routeName;
        this.busPlate = busPlate;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.status = status;
        this.availableSeats = availableSeats;
        this.price = price;
    }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }
    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }
    public String getBusPlate() { return busPlate; }
    public void setBusPlate(String busPlate) { this.busPlate = busPlate; }
    public OffsetDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(OffsetDateTime departureTime) { this.departureTime = departureTime; }
    public OffsetDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(OffsetDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
