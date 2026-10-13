package ec.edu.upec.rutanorte.repository;

import ec.edu.upec.rutanorte.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, UUID> {

    List<BookingSeat> findByBookingId(UUID bookingId);

    @Query("SELECT bs FROM BookingSeat bs " +
           "WHERE bs.booking.trip.id = :tripId " +
           "AND bs.status IN ('reserved', 'sold')")
    List<BookingSeat> findOccupiedSeatsByTrip(@Param("tripId") UUID tripId);

    @Query("SELECT COUNT(bs) > 0 FROM BookingSeat bs " +
           "WHERE bs.booking.trip.id = :tripId " +
           "AND bs.busSeat.id IN :seatIds " +
           "AND bs.status IN ('reserved', 'sold')")
    boolean areAnySeatsOccupied(
        @Param("tripId") UUID tripId,
        @Param("seatIds") List<UUID> seatIds
    );
}
