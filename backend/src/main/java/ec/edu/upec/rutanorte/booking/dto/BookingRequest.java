package ec.edu.upec.rutanorte.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public class BookingRequest {

    @NotNull(message = "El tripId es obligatorio")
    private UUID tripId;

    @NotNull(message = "El origen es obligatorio")
    private UUID originStopId;

    @NotNull(message = "El destino es obligatorio")
    private UUID destinationStopId;

    @NotNull(message = "El pasajero es obligatorio")
    private UUID passengerId;

    @NotEmpty(message = "Debe seleccionar al menos un asiento")
    private List<UUID> seatIds;

    public BookingRequest() {}

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }

    public UUID getOriginStopId() { return originStopId; }
    public void setOriginStopId(UUID originStopId) { this.originStopId = originStopId; }

    public UUID getDestinationStopId() { return destinationStopId; }
    public void setDestinationStopId(UUID destinationStopId) { this.destinationStopId = destinationStopId; }

    public UUID getPassengerId() { return passengerId; }
    public void setPassengerId(UUID passengerId) { this.passengerId = passengerId; }

    public List<UUID> getSeatIds() { return seatIds; }
    public void setSeatIds(List<UUID> seatIds) { this.seatIds = seatIds; }
}
