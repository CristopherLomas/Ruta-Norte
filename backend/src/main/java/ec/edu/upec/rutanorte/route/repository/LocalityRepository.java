package ec.edu.upec.rutanorte.route.repository;

import ec.edu.upec.rutanorte.route.entity.Locality;

import ec.edu.upec.rutanorte.route.entity.Locality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LocalityRepository extends JpaRepository<Locality, UUID> {
}
