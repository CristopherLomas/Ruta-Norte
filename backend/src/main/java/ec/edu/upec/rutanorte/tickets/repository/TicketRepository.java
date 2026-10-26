package ec.edu.upec.rutanorte.tickets.repository;

import ec.edu.upec.rutanorte.tickets.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    List<Ticket> findByTripId(UUID tripId);

    Optional<Ticket> findByTripIdAndSeatNumber(UUID tripId, int seatNumber);

    Optional<Ticket> findByQrToken(String qrToken);

    long countByTripId(UUID tripId);

    @Query("SELECT t.seatNumber FROM Ticket t WHERE t.trip.id = :tripId")
    List<Integer> findOccupiedSeatNumbersByTripId(@Param("tripId") UUID tripId);

    List<Ticket> findTop20ByOrderByCreatedAtDesc();
}
