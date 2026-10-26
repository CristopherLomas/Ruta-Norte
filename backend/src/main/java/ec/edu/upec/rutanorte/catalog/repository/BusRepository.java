package ec.edu.upec.rutanorte.catalog.repository;

import ec.edu.upec.rutanorte.catalog.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {
    List<Bus> findAllByOrderByIdAsc();
}
