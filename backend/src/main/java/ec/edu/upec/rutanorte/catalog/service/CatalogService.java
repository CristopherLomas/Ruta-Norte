package ec.edu.upec.rutanorte.catalog.service;

import ec.edu.upec.rutanorte.catalog.entity.Bus;
import ec.edu.upec.rutanorte.catalog.entity.City;
import ec.edu.upec.rutanorte.catalog.repository.BusRepository;
import ec.edu.upec.rutanorte.catalog.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogService {

    private final CityRepository cityRepository;
    private final BusRepository busRepository;

    public CatalogService(CityRepository cityRepository, BusRepository busRepository) {
        this.cityRepository = cityRepository;
        this.busRepository = busRepository;
    }

    public List<City> getAllCities() {
        return cityRepository.findAllByOrderByIdAsc();
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAllByOrderByIdAsc();
    }

    @Transactional
    public Bus createBus(Bus bus) {
        if (bus.getCapacity() == null || bus.getCapacity() <= 0) {
            bus.setCapacity(40);
        }
        return busRepository.save(bus);
    }
}
