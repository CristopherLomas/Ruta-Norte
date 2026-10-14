package ec.edu.upec.rutanorte.trip.service;

import ec.edu.upec.rutanorte.booking.repository.BookingSeatRepository;
import ec.edu.upec.rutanorte.fleet.entity.BusSeat;
import ec.edu.upec.rutanorte.fleet.repository.BusSeatRepository;
import ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException;
import ec.edu.upec.rutanorte.trip.entity.Trip;
import ec.edu.upec.rutanorte.trip.repository.TripRepository;

import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final BusSeatRepository busSeatRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public TripService(
            TripRepository tripRepository,
            BusSeatRepository busSeatRepository,
            BookingSeatRepository bookingSeatRepository
    ) {
        this.tripRepository = tripRepository;
        this.busSeatRepository = busSeatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    public List<Trip> searchTrips(UUID routeId) {
        if (routeId != null) {
            return tripRepository.findUpcomingTripsByRoute(routeId, OffsetDateTime.now());
        }
        return tripRepository.findByStatusOrderByDepartureTimeAsc("scheduled");
    }

    public Trip getTripById(UUID tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado: " + tripId));
    }

    public Map<String, Object> getSeatAvailability(UUID tripId) {
        Trip trip = getTripById(tripId);
        List<BusSeat> allSeats = busSeatRepository.findByBusIdAndIsActiveTrueOrderBySeatRowAscSeatColumnAsc(trip.getBus().getId());
        
        Set<UUID> occupiedSeatIds = bookingSeatRepository.findOccupiedSeatsByTrip(tripId).stream()
                .map(bs -> bs.getBusSeat().getId())
                .collect(Collectors.toSet());

        List<Map<String, Object>> seatDetails = new ArrayList<>();
        for (BusSeat seat : allSeats) {
            Map<String, Object> s = new HashMap<>();
            s.put("id", seat.getId());
            s.put("seatNumber", seat.getSeatNumber());
            s.put("row", seat.getSeatRow());
            s.put("column", seat.getSeatColumn());
            s.put("type", seat.getSeatType());
            s.put("isAvailable", !occupiedSeatIds.contains(seat.getId()));
            seatDetails.add(s);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("tripId", trip.getId());
        result.put("totalSeats", trip.getBus().getTotalSeats());
        result.put("availableSeats", trip.getAvailableSeats());
        result.put("seats", seatDetails);

        return result;
    }
}
