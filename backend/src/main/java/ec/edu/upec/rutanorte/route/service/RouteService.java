package ec.edu.upec.rutanorte.route.service;

import ec.edu.upec.rutanorte.route.dto.RouteDto;
import ec.edu.upec.rutanorte.route.entity.Route;
import ec.edu.upec.rutanorte.route.repository.RouteRepository;
import ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException;

import ec.edu.upec.rutanorte.route.dto.RouteDto;
import ec.edu.upec.rutanorte.route.entity.Route;
import ec.edu.upec.rutanorte.route.repository.RouteRepository;
import ec.edu.upec.rutanorte.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<RouteDto> getAllActiveRoutes() {
        return routeRepository.findByIsActiveTrue().stream()
                .map(r -> new RouteDto(r.getId(), r.getName(), r.getCode(), "Origen", "Destino", r.getDistanceKm(), r.getDurationMin(), r.getIsActive()))
                .collect(Collectors.toList());
    }

    public RouteDto getRouteById(UUID id) {
        Route r = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ruta no encontrada: " + id));
        return new RouteDto(r.getId(), r.getName(), r.getCode(), "Origen", "Destino", r.getDistanceKm(), r.getDurationMin(), r.getIsActive());
    }
}
