package ec.edu.upec.rutanorte.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_stop_id", nullable = false)
    private Stop originStop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_stop_id", nullable = false)
    private Stop destinationStop;

    @Column(name = "distance_km", precision = 8, scale = 2, nullable = false)
    private BigDecimal distanceKm;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Route() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Stop getOriginStop() { return originStop; }
    public void setOriginStop(Stop originStop) { this.originStop = originStop; }

    public Stop getDestinationStop() { return destinationStop; }
    public void setDestinationStop(Stop destinationStop) { this.destinationStop = destinationStop; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
