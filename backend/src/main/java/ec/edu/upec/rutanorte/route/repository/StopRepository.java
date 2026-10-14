package ec.edu.upec.rutanorte.route.repository;

import ec.edu.upec.rutanorte.route.entity.Stop;

import ec.edu.upec.rutanorte.route.entity.Stop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StopRepository extends JpaRepository<Stop, UUID> {
}
