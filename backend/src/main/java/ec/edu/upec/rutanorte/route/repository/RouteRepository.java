package ec.edu.upec.rutanorte.route.repository;

import ec.edu.upec.rutanorte.route.entity.Route;

import ec.edu.upec.rutanorte.route.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RouteRepository extends JpaRepository<Route, UUID> {
    List<Route> findByIsActiveTrue();
}
