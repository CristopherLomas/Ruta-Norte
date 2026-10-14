package ec.edu.upec.rutanorte.route.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class RouteDto {
    private UUID id;
    private String name;
    private String code;
    private String originStop;
    private String destinationStop;
    private BigDecimal distanceKm;
    private Integer durationMin;
    private Boolean isActive;

    public RouteDto() {}

    public RouteDto(UUID id, String name, String code, String originStop, String destinationStop, BigDecimal distanceKm, Integer durationMin, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.originStop = originStop;
        this.destinationStop = destinationStop;
        this.distanceKm = distanceKm;
        this.durationMin = durationMin;
        this.isActive = isActive;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getOriginStop() { return originStop; }
    public void setOriginStop(String originStop) { this.originStop = originStop; }
    public String getDestinationStop() { return destinationStop; }
    public void setDestinationStop(String destinationStop) { this.destinationStop = destinationStop; }
    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
