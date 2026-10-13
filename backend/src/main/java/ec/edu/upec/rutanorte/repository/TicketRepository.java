package ec.edu.upec.rutanorte.repository;

import ec.edu.upec.rutanorte.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    Optional<Ticket> findByQrCode(String qrCode);

    List<Ticket> findByPassengerIdOrderByIssuedAtDesc(UUID passengerId);

    List<Ticket> findByBookingId(UUID bookingId);

    @Query("SELECT t FROM Ticket t WHERE t.booking.trip.id = :tripId ORDER BY t.issuedAt ASC")
    List<Ticket> findManifestByTripId(@Param("tripId") UUID tripId);
}
