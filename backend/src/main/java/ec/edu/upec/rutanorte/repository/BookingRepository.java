package ec.edu.upec.rutanorte.repository;

import ec.edu.upec.rutanorte.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByPassengerIdOrderByCreatedAtDesc(UUID passengerId);

    List<Booking> findByTripId(UUID tripId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'pending' AND b.expiresAt < :now")
    List<Booking> findExpiredPendingBookings(@Param("now") OffsetDateTime now);
}
