package ec.edu.upec.rutanorte.fleet.repository;

import ec.edu.upec.rutanorte.fleet.entity.Bus;

import ec.edu.upec.rutanorte.fleet.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusRepository extends JpaRepository<Bus, UUID> {
    List<Bus> findByIsActiveTrue();
}
