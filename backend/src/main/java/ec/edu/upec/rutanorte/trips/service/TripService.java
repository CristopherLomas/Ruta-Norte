package ec.edu.upec.rutanorte.trips.service;

import ec.edu.upec.rutanorte.catalog.entity.Bus;
import ec.edu.upec.rutanorte.catalog.entity.City;
import ec.edu.upec.rutanorte.catalog.repository.BusRepository;
import ec.edu.upec.rutanorte.catalog.repository.CityRepository;
import ec.edu.upec.rutanorte.tickets.repository.TicketRepository;
import ec.edu.upec.rutanorte.trips.dto.CreateTripRequest;
import ec.edu.upec.rutanorte.trips.dto.SeatStatusDto;
import ec.edu.upec.rutanorte.trips.dto.TripSearchResponse;
import ec.edu.upec.rutanorte.trips.entity.Trip;
import ec.edu.upec.rutanorte.trips.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final TicketRepository ticketRepository;
    private final CityRepository cityRepository;
    private final BusRepository busRepository;

    public TripService(TripRepository tripRepository, TicketRepository ticketRepository, CityRepository cityRepository, BusRepository busRepository) {
        this.tripRepository = tripRepository;
        this.ticketRepository = ticketRepository;
        this.cityRepository = cityRepository;
        this.busRepository = busRepository;
    }

    public List<TripSearchResponse> searchTrips(Integer originId, Integer destinationId, LocalDate date, String shift) {
        LocalDate searchDate = date != null ? date : LocalDate.now();
        List<Trip> trips;
        if (originId != null && destinationId != null) {
            trips = tripRepository.searchTrips(originId, destinationId, searchDate, (shift != null && !shift.isBlank()) ? shift.toUpperCase() : null);
        } else {
            trips = tripRepository.findByDepartureDateOrderByDepartureTimeAsc(searchDate);
        }

        List<TripSearchResponse> responses = new ArrayList<>();
        for (Trip trip : trips) {
            TripSearchResponse resp = mapToResponse(trip);
            responses.add(resp);
        }
        return responses;
    }

    public List<SeatStatusDto> getTripSeats(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + tripId));

        Set<Integer> occupiedSeats = new HashSet<>(ticketRepository.findOccupiedSeatNumbersByTripId(tripId));
        int totalSeats = (trip.getBus() != null && trip.getBus().getCapacity() != null) ? trip.getBus().getCapacity() : 40;

        List<SeatStatusDto> seats = new ArrayList<>();
        for (int i = 1; i <= totalSeats; i++) {
            seats.add(new SeatStatusDto(i, occupiedSeats.contains(i) ? "OCCUPIED" : "AVAILABLE"));
        }
        return seats;
    }

    @Transactional
    public Trip createTrip(CreateTripRequest req) {
        City origin = cityRepository.findById(req.getOriginCityId())
            .orElseThrow(() -> new IllegalArgumentException("Ciudad de origen no encontrada: " + req.getOriginCityId()));
        City destination = cityRepository.findById(req.getDestinationCityId())
            .orElseThrow(() -> new IllegalArgumentException("Ciudad de destino no encontrada: " + req.getDestinationCityId()));
        Bus bus = busRepository.findById(req.getBusId())
            .orElseThrow(() -> new IllegalArgumentException("Bus no encontrado: " + req.getBusId()));

        if (origin.getId().equals(destination.getId())) {
            throw new IllegalArgumentException("El origen y destino no pueden ser la misma ciudad");
        }

        LocalTime depTime = req.getDepartureTime();
        String shift;
        if (depTime.isBefore(LocalTime.of(12, 0))) {
            shift = "MORNING";
        } else if (depTime.isBefore(LocalTime.of(18, 0))) {
            shift = "AFTERNOON";
        } else {
            shift = "NIGHT";
        }

        Trip trip = new Trip();
        trip.setOriginCity(origin);
        trip.setDestinationCity(destination);
        trip.setBus(bus);
        trip.setDepartureDate(req.getDepartureDate());
        trip.setDepartureTime(depTime);
        trip.setShift(shift);
        trip.setPrice(req.getPrice());

        return tripRepository.save(trip);
    }

    public Trip getTripById(UUID tripId) {
        return tripRepository.findById(tripId)
            .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + tripId));
    }

    public TripSearchResponse mapToResponse(Trip trip) {
        TripSearchResponse resp = new TripSearchResponse();
        resp.setId(trip.getId());
        resp.setOriginCityId(trip.getOriginCity().getId());
        resp.setOriginCityName(trip.getOriginCity().getName());
        resp.setOriginTerminal(trip.getOriginCity().getTerminalName());
        resp.setDestinationCityId(trip.getDestinationCity().getId());
        resp.setDestinationCityName(trip.getDestinationCity().getName());
        resp.setDestinationTerminal(trip.getDestinationCity().getTerminalName());

        if (trip.getBus() != null) {
            resp.setBusId(trip.getBus().getId());
            resp.setCooperativeName(trip.getBus().getCooperativeName());
            resp.setUnitNumber(trip.getBus().getUnitNumber());
            resp.setPlate(trip.getBus().getPlate());
            resp.setPhotoUrl(trip.getBus().getPhotoUrl());
            resp.setTotalSeats(trip.getBus().getCapacity() != null ? trip.getBus().getCapacity() : 40);
        } else {
            resp.setTotalSeats(40);
        }

        resp.setDepartureDate(trip.getDepartureDate());
        resp.setDepartureTime(trip.getDepartureTime());
        resp.setShift(trip.getShift());
        resp.setPrice(trip.getPrice());

        int occupied = (int) ticketRepository.countByTripId(trip.getId());
        resp.setOccupiedSeats(occupied);
        resp.setAvailableSeats(Math.max(0, resp.getTotalSeats() - occupied));
        return resp;
    }
}
