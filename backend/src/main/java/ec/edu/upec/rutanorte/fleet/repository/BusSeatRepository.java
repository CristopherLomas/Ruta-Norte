package ec.edu.upec.rutanorte.fleet.repository;

import ec.edu.upec.rutanorte.fleet.entity.BusSeat;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusSeatRepository extends JpaRepository<BusSeat, UUID> {

    List<BusSeat> findByBusIdAndIsActiveTrueOrderBySeatRowAscSeatColumnAsc(UUID busId);

    /**
     * Bloqueo pesimista exclusivo (SELECT ... FOR UPDATE)
     * Impide que dos transacciones concurrentes reserven el mismo asiento al mismo tiempo.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM BusSeat s WHERE s.id = :seatId")
    Optional<BusSeat> findByIdForUpdate(@Param("seatId") UUID seatId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM BusSeat s WHERE s.id IN :seatIds")
    List<BusSeat> findAllByIdForUpdate(@Param("seatIds") List<UUID> seatIds);
}
