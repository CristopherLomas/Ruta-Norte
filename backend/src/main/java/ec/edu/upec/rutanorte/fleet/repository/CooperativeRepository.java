package ec.edu.upec.rutanorte.fleet.repository;

import ec.edu.upec.rutanorte.fleet.entity.Cooperative;

import ec.edu.upec.rutanorte.fleet.entity.Cooperative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CooperativeRepository extends JpaRepository<Cooperative, UUID> {
}
