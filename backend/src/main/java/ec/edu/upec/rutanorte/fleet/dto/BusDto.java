package ec.edu.upec.rutanorte.fleet.dto;

import java.util.UUID;

public class BusDto {
    private UUID id;
    private String plate;
    private String model;
    private String brand;
    private Integer year;
    private Integer totalSeats;
    private Boolean isActive;

    public BusDto() {}

    public BusDto(UUID id, String plate, String model, String brand, Integer year, Integer totalSeats, Boolean isActive) {
        this.id = id;
        this.plate = plate;
        this.model = model;
        this.brand = brand;
        this.year = year;
        this.totalSeats = totalSeats;
        this.isActive = isActive;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
