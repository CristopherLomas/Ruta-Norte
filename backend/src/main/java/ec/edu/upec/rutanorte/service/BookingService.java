package ec.edu.upec.rutanorte.service;

import ec.edu.upec.rutanorte.dto.BookingRequest;
import ec.edu.upec.rutanorte.dto.BookingResponse;
import ec.edu.upec.rutanorte.entity.*;
import ec.edu.upec.rutanorte.exception.BadRequestException;
import ec.edu.upec.rutanorte.exception.ResourceNotFoundException;
import ec.edu.upec.rutanorte.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BusSeatRepository busSeatRepository;
    private final TripRepository tripRepository;
    private final ProfileRepository profileRepository;

    public BookingService(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            BusSeatRepository busSeatRepository,
            TripRepository tripRepository,
            ProfileRepository profileRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.busSeatRepository = busSeatRepository;
        this.tripRepository = tripRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Reserva atómica de asientos con bloqueo pesimista y expiración a 10 minutos.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponse createBooking(BookingRequest request) {
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado: " + request.getTripId()));

        if (!"scheduled".equalsIgnoreCase(trip.getStatus()) && !"boarding".equalsIgnoreCase(trip.getStatus())) {
            throw new BadRequestException("No se pueden reservar asientos en un viaje con estado: " + trip.getStatus());
        }

        Profile passenger = profileRepository.findById(request.getPassengerId())
                .orElseThrow(() -> new ResourceNotFoundException("Pasajero no encontrado: " + request.getPassengerId()));

        // 1. Bloqueo pesimista de los asientos solicitados
        List<BusSeat> lockedSeats = busSeatRepository.findAllByIdForUpdate(request.getSeatIds());
        if (lockedSeats.size() != request.getSeatIds().size()) {
            throw new BadRequestException("Uno o más asientos no existen en la unidad asignada.");
        }

        // 2. Verificar que ninguno de los asientos esté ocupado o reservado vigente
        boolean anyOccupied = bookingSeatRepository.areAnySeatsOccupied(trip.getId(), request.getSeatIds());
        if (anyOccupied) {
            throw new BadRequestException("Uno o más asientos seleccionados ya no se encuentran disponibles.");
        }

        // 3. Crear registro de reserva con expiración a 10 minutos
        BigDecimal farePerSeat = new BigDecimal("3.50"); // Tarifa base intercantonal
        BigDecimal totalAmount = farePerSeat.multiply(new BigDecimal(lockedSeats.size()));

        Booking booking = new Booking();
        booking.setTrip(trip);
        booking.setPassenger(passenger);
        booking.setOriginStop(trip.getRoute().getOriginStop());
        booking.setDestinationStop(trip.getRoute().getDestinationStop());
        booking.setStatus("pending");
        booking.setExpiresAt(OffsetDateTime.now().plusMinutes(10));
        booking.setTotalAmount(totalAmount);

        Booking savedBooking = bookingRepository.save(booking);

        // 4. Bloquear cada asiento asociándolo a la reserva
        List<String> seatNumbers = new ArrayList<>();
        for (BusSeat seat : lockedSeats) {
            BookingSeat bookingSeat = new BookingSeat(savedBooking, seat, "reserved");
            bookingSeatRepository.save(bookingSeat);
            seatNumbers.add(seat.getSeatNumber());
        }

        // 5. Descontar cupo en available_seats
        trip.setAvailableSeats(Math.max(0, trip.getAvailableSeats() - lockedSeats.size()));
        tripRepository.save(trip);

        return new BookingResponse(
                savedBooking.getId(),
                trip.getId(),
                savedBooking.getStatus(),
                savedBooking.getExpiresAt(),
                savedBooking.getTotalAmount(),
                seatNumbers
        );
    }

    @Transactional
    public void cancelBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada: " + bookingId));

        if ("cancelled".equalsIgnoreCase(booking.getStatus())) {
            return;
        }

        booking.setStatus("cancelled");
        bookingRepository.save(booking);

        List<BookingSeat> seats = bookingSeatRepository.findByBookingId(bookingId);
        for (BookingSeat bs : seats) {
            bs.setStatus("cancelled");
            bookingSeatRepository.save(bs);
        }

        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + seats.size());
        tripRepository.save(trip);
    }
}
