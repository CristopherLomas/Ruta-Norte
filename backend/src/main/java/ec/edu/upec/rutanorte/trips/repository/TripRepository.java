package ec.edu.upec.rutanorte.trips.repository;

import ec.edu.upec.rutanorte.trips.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    @Query("SELECT t FROM Trip t WHERE t.originCity.id = :originId AND t.destinationCity.id = :destinationId AND t.departureDate = :date AND (:shift IS NULL OR t.shift = :shift) ORDER BY t.departureTime ASC")
    List<Trip> searchTrips(
        @Param("originId") Integer originId,
        @Param("destinationId") Integer destinationId,
        @Param("date") LocalDate date,
        @Param("shift") String shift
    );

    List<Trip> findByDepartureDateOrderByDepartureTimeAsc(LocalDate date);
}
