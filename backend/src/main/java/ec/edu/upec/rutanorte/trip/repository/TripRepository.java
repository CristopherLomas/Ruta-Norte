package ec.edu.upec.rutanorte.trip.repository;

import ec.edu.upec.rutanorte.trip.entity.Trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    @Query("SELECT t FROM Trip t " +
           "WHERE t.route.id = :routeId " +
           "AND t.departureTime >= :startTime " +
           "AND t.status IN ('scheduled', 'boarding') " +
           "ORDER BY t.departureTime ASC")
    List<Trip> findUpcomingTripsByRoute(
        @Param("routeId") UUID routeId,
        @Param("startTime") OffsetDateTime startTime
    );

    List<Trip> findByStatusOrderByDepartureTimeAsc(String status);
}
