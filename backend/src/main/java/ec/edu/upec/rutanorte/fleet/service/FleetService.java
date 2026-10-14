package ec.edu.upec.rutanorte.fleet.service;

import ec.edu.upec.rutanorte.fleet.dto.BusDto;
import ec.edu.upec.rutanorte.fleet.entity.Bus;
import ec.edu.upec.rutanorte.fleet.repository.BusRepository;
import ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException;

import ec.edu.upec.rutanorte.fleet.dto.BusDto;
import ec.edu.upec.rutanorte.fleet.entity.Bus;
import ec.edu.upec.rutanorte.fleet.repository.BusRepository;
import ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FleetService {

    private final BusRepository busRepository;

    public FleetService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<BusDto> getAllActiveBuses() {
        return busRepository.findByIsActiveTrue().stream()
                .map(b -> new BusDto(b.getId(), b.getPlate(), b.getModel(), b.getBrand(), b.getYear(), b.getTotalSeats(), b.getIsActive()))
                .collect(Collectors.toList());
    }

    public BusDto getBusById(UUID id) {
        Bus b = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada: " + id));
        return new BusDto(b.getId(), b.getPlate(), b.getModel(), b.getBrand(), b.getYear(), b.getTotalSeats(), b.getIsActive());
    }
}
