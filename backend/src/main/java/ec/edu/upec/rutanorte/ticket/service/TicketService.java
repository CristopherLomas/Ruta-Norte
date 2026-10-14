package ec.edu.upec.rutanorte.ticket.service;

import ec.edu.upec.rutanorte.booking.entity.Booking;
import ec.edu.upec.rutanorte.fleet.entity.BusSeat;
import ec.edu.upec.rutanorte.ticket.entity.Ticket;
import ec.edu.upec.rutanorte.ticket.repository.TicketRepository;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    /**
     * Emite un boleto digital con un token QR criptográfico opaco (ADR-002).
     * No expone cédula, teléfono ni nombre del pasajero al escanearse con aplicaciones públicas.
     */
    public Ticket issueTicket(Booking booking, BusSeat seat) {
        String rawTokenSource = booking.getId().toString() + "-" + seat.getId().toString() + "-" + System.currentTimeMillis();
        String qrToken = "RN-" + sha256Hex(rawTokenSource).substring(0, 16).toUpperCase();

        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setBusSeat(seat);
        ticket.setPassenger(booking.getPassenger());
        ticket.setQrCode(qrToken);
        ticket.setStatus("issued");
        ticket.setIssuedAt(OffsetDateTime.now());

        return ticketRepository.save(ticket);
    }

    public ec.edu.upec.rutanorte.ticket.dto.TicketResponse getTicketById(UUID id) {
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException("Boleto no encontrado: " + id));
        String seatNum = t.getBusSeat() != null ? t.getBusSeat().getSeatNumber() : "N/A";
        String passengerName = t.getPassenger() != null ? t.getPassenger().getFullName() : "N/A";
        UUID bookingId = t.getBooking() != null ? t.getBooking().getId() : null;
        return new ec.edu.upec.rutanorte.ticket.dto.TicketResponse(t.getId(), bookingId, seatNum, passengerName, t.getQrCode(), t.getStatus(), t.getIssuedAt(), t.getBoardedAt());
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
