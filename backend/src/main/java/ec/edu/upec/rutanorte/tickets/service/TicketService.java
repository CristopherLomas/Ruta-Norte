package ec.edu.upec.rutanorte.tickets.service;

import ec.edu.upec.rutanorte.tickets.dto.PurchaseTicketRequest;
import ec.edu.upec.rutanorte.tickets.dto.TicketResponse;
import ec.edu.upec.rutanorte.tickets.dto.ValidateQrResponse;
import ec.edu.upec.rutanorte.tickets.entity.Ticket;
import ec.edu.upec.rutanorte.tickets.repository.TicketRepository;
import ec.edu.upec.rutanorte.trips.entity.Trip;
import ec.edu.upec.rutanorte.trips.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public TicketService(TicketRepository ticketRepository, TripRepository tripRepository) {
        this.ticketRepository = ticketRepository;
        this.tripRepository = tripRepository;
    }

    @Transactional
    public List<TicketResponse> purchaseTickets(PurchaseTicketRequest request) {
        if (request.getTripId() == null) {
            throw new IllegalArgumentException("El ID del viaje es requerido");
        }
        if (request.getSeatNumbers() == null || request.getSeatNumbers().isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar al menos un asiento");
        }

        Trip trip = tripRepository.findById(request.getTripId())
            .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + request.getTripId()));

        String passengerName = (request.getPassengerName() != null && !request.getPassengerName().trim().isEmpty())
            ? request.getPassengerName().trim()
            : "Pasajero General";

        List<TicketResponse> createdTickets = new ArrayList<>();

        for (Integer seatNumber : request.getSeatNumbers()) {
            if (seatNumber == null || seatNumber < 1 || seatNumber > 40) {
                throw new IllegalArgumentException("El número de asiento debe estar entre 1 y 40");
            }

            Optional<Ticket> existing = ticketRepository.findByTripIdAndSeatNumber(trip.getId(), seatNumber);
            if (existing.isPresent()) {
                throw new IllegalStateException("El asiento #" + seatNumber + " ya se encuentra ocupado");
            }

            String qrToken = generateUniqueQrToken();
            Ticket ticket = new Ticket(trip, passengerName, seatNumber, qrToken, "PAID");
            Ticket saved = ticketRepository.save(ticket);
            createdTickets.add(mapToResponse(saved));
        }

        return createdTickets;
    }

    @Transactional
    public ValidateQrResponse validateQr(String qrToken) {
        if (qrToken == null || qrToken.trim().isEmpty()) {
            return ValidateQrResponse.error("El código QR no puede estar vacío", "INVALID");
        }

        String cleanedToken = qrToken.trim();
        Optional<Ticket> ticketOpt = ticketRepository.findByQrToken(cleanedToken);

        if (ticketOpt.isEmpty()) {
            return ValidateQrResponse.error("BOLETO NO ENCONTRADO EN EL SISTEMA", "NOT_FOUND");
        }

        Ticket ticket = ticketOpt.get();
        Trip trip = ticket.getTrip();
        String origin = trip.getOriginCity() != null ? trip.getOriginCity().getName() : "Origen";
        String destination = trip.getDestinationCity() != null ? trip.getDestinationCity().getName() : "Destino";
        String time = trip.getDepartureTime() != null ? trip.getDepartureTime().toString() : "";

        if ("BOARDED".equalsIgnoreCase(ticket.getStatus())) {
            String boardedDate = ticket.getBoardedAt() != null
                ? ticket.getBoardedAt().format(DateTimeFormatter.ofPattern("HH:mm:ss"))
                : "";
            return ValidateQrResponse.error(
                "BOLETO YA UTILIZADO PREVIAMENTE (Abordó a las " + boardedDate + ") - ASIENTO #" + ticket.getSeatNumber(),
                "BOARDED"
            );
        }

        // Marcar como abordado
        ticket.setStatus("BOARDED");
        ticket.setBoardedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        return ValidateQrResponse.success(
            "PASAJERO VALIDADO - ABORDAJE AUTORIZADO",
            ticket.getSeatNumber(),
            ticket.getPassengerName(),
            origin,
            destination,
            time
        );
    }

    public List<TicketResponse> getRecentTickets() {
        List<Ticket> list = ticketRepository.findTop20ByOrderByCreatedAtDesc();
        List<TicketResponse> responses = new ArrayList<>();
        for (Ticket t : list) {
            responses.add(mapToResponse(t));
        }
        return responses;
    }

    public TicketResponse getTicketById(UUID id) {
        Ticket t = ticketRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Boleto no encontrado con ID: " + id));
        return mapToResponse(t);
    }

    private String generateUniqueQrToken() {
        while (true) {
            StringBuilder sb = new StringBuilder("RN-");
            for (int i = 0; i < 12; i++) {
                sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
            }
            String token = sb.toString();
            if (ticketRepository.findByQrToken(token).isEmpty()) {
                return token;
            }
        }
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse resp = new TicketResponse();
        resp.setId(ticket.getId());
        resp.setPassengerName(ticket.getPassengerName());
        resp.setSeatNumber(ticket.getSeatNumber());
        resp.setQrToken(ticket.getQrToken());
        resp.setStatus(ticket.getStatus());
        resp.setCreatedAt(ticket.getCreatedAt());
        resp.setBoardedAt(ticket.getBoardedAt());

        Trip trip = ticket.getTrip();
        if (trip != null) {
            resp.setTripId(trip.getId());
            resp.setDepartureDate(trip.getDepartureDate());
            resp.setDepartureTime(trip.getDepartureTime());
            resp.setPrice(trip.getPrice());

            if (trip.getOriginCity() != null) {
                resp.setOriginCity(trip.getOriginCity().getName());
                resp.setOriginTerminal(trip.getOriginCity().getTerminalName());
            }
            if (trip.getDestinationCity() != null) {
                resp.setDestinationCity(trip.getDestinationCity().getName());
                resp.setDestinationTerminal(trip.getDestinationCity().getTerminalName());
            }
            if (trip.getBus() != null) {
                resp.setCooperativeName(trip.getBus().getCooperativeName());
                resp.setUnitNumber(trip.getBus().getUnitNumber());
                resp.setPlate(trip.getBus().getPlate());
            }
        }
        return resp;
    }
}
