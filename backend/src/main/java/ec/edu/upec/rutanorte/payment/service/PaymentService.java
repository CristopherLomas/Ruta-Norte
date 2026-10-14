package ec.edu.upec.rutanorte.payment.service;

import ec.edu.upec.rutanorte.booking.entity.Booking;
import ec.edu.upec.rutanorte.booking.entity.BookingSeat;
import ec.edu.upec.rutanorte.booking.repository.BookingRepository;
import ec.edu.upec.rutanorte.booking.repository.BookingSeatRepository;
import ec.edu.upec.rutanorte.payment.dto.PaymentRequest;
import ec.edu.upec.rutanorte.payment.dto.PaymentResponse;
import ec.edu.upec.rutanorte.payment.entity.Payment;
import ec.edu.upec.rutanorte.payment.repository.PaymentRepository;
import ec.edu.upec.rutanorte.shared.exception.BadRequestException;
import ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException;
import ec.edu.upec.rutanorte.ticket.entity.Ticket;
import ec.edu.upec.rutanorte.ticket.service.TicketService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final TicketService ticketService;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            TicketService ticketService
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.ticketService = ticketService;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada: " + request.getBookingId()));

        if ("confirmed".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Esta reserva ya se encuentra pagada y confirmada.");
        }

        if (booking.getExpiresAt().isBefore(OffsetDateTime.now())) {
            booking.setStatus("expired");
            bookingRepository.save(booking);
            throw new BadRequestException("La reserva temporal ha expirado (ventana de 10 min superada).");
        }

        // 1. Registrar pago simulado
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus("completed");
        payment.setSimulatedReference("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setProcessedAt(OffsetDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);

        // 2. Confirmar la reserva y marcar asientos como vendidos
        booking.setStatus("confirmed");
        bookingRepository.save(booking);

        List<BookingSeat> seats = bookingSeatRepository.findByBookingId(booking.getId());
        List<PaymentResponse.TicketDto> ticketDtos = new ArrayList<>();

        for (BookingSeat bs : seats) {
            bs.setStatus("sold");
            bookingSeatRepository.save(bs);

            // 3. Emitir boleto con token QR
            Ticket ticket = ticketService.issueTicket(booking, bs.getBusSeat());
            ticketDtos.add(new PaymentResponse.TicketDto(
                    ticket.getId(),
                    bs.getBusSeat().getSeatNumber(),
                    ticket.getQrCode()
            ));
        }

        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(savedPayment.getId());
        response.setBookingId(booking.getId());
        response.setStatus(savedPayment.getStatus());
        response.setAmount(savedPayment.getAmount());
        response.setReference(savedPayment.getSimulatedReference());
        response.setTickets(ticketDtos);

        return response;
    }
}
