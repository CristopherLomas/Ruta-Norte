package ec.edu.upec.rutanorte.trips.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class CreateTripRequest {

    private Integer originCityId;
    private Integer destinationCityId;
    private Integer busId;
    private LocalDate departureDate;
    private LocalTime departureTime;
    private BigDecimal price;

    public CreateTripRequest() {}

    public Integer getOriginCityId() {
        return originCityId;
    }

    public void setOriginCityId(Integer originCityId) {
        this.originCityId = originCityId;
    }

    public Integer getDestinationCityId() {
        return destinationCityId;
    }

    public void setDestinationCityId(Integer destinationCityId) {
        this.destinationCityId = destinationCityId;
    }

    public Integer getBusId() {
        return busId;
    }

    public void setBusId(Integer busId) {
        this.busId = busId;
    }

    public LocalDate getDepartureDate() {
        return departureDate;
    }

    public void setDepartureDate(LocalDate departureDate) {
        this.departureDate = departureDate;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
