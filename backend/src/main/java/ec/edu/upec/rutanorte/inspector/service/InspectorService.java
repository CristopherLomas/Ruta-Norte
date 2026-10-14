package ec.edu.upec.rutanorte.inspector.service;

import ec.edu.upec.rutanorte.auth.repository.ProfileRepository;
import ec.edu.upec.rutanorte.inspector.dto.ValidateBoardingRequest;
import ec.edu.upec.rutanorte.inspector.dto.ValidateBoardingResponse;
import ec.edu.upec.rutanorte.ticket.entity.Ticket;
import ec.edu.upec.rutanorte.ticket.repository.TicketRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class InspectorService {

    private final TicketRepository ticketRepository;
    private final ProfileRepository profileRepository;

    public InspectorService(TicketRepository ticketRepository, ProfileRepository profileRepository) {
        this.ticketRepository = ticketRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public ValidateBoardingResponse validateBoarding(ValidateBoardingRequest request) {
        Optional<Ticket> optTicket = ticketRepository.findByQrCode(request.getQrPayload().trim());

        if (optTicket.isEmpty()) {
            return ValidateBoardingResponse.invalid("Boleto inválido: código QR no registrado en el sistema.");
        }

        Ticket ticket = optTicket.get();

        if ("used".equalsIgnoreCase(ticket.getStatus())) {
            return ValidateBoardingResponse.invalid("ALERTA DE FRAUDE: El boleto ya fue abordado previamente el " + ticket.getBoardedAt());
        }

        if ("cancelled".equalsIgnoreCase(ticket.getStatus())) {
            return ValidateBoardingResponse.invalid("El boleto se encuentra anulado/cancelado.");
        }

        // Marcar boleto como abordado y registrar auditoría
        ticket.setStatus("used");
        ticket.setBoardedAt(OffsetDateTime.now());

        if (request.getInspectorId() != null) {
            profileRepository.findById(request.getInspectorId()).ifPresent(ticket::setBoardedBy);
        }

        ticketRepository.save(ticket);

        String passengerName = ticket.getPassenger() != null ? ticket.getPassenger().getFullName() : "Pasajero";
        String seatNumber = ticket.getBusSeat() != null ? ticket.getBusSeat().getSeatNumber() : "N/A";
        String routeName = ticket.getBooking().getTrip().getRoute().getName();

        return ValidateBoardingResponse.success(
                ticket.getId(),
                passengerName,
                seatNumber,
                routeName,
                ticket.getBoardedAt()
        );
    }
}
