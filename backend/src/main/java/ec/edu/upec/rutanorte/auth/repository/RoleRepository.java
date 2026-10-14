package ec.edu.upec.rutanorte.auth.repository;

import ec.edu.upec.rutanorte.auth.entity.Role;

import ec.edu.upec.rutanorte.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String name);
}
