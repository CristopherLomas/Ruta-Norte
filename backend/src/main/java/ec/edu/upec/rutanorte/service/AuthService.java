package ec.edu.upec.rutanorte.service;

import ec.edu.upec.rutanorte.config.JwtService;
import ec.edu.upec.rutanorte.dto.AuthRequest;
import ec.edu.upec.rutanorte.dto.AuthResponse;
import ec.edu.upec.rutanorte.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final JwtService jwtService;

    // Catálogo de usuarios demo para defensa académica
    private static final Map<String, DemoUser> DEMO_USERS = new HashMap<>();

    static {
        DEMO_USERS.put("admin.demo@rutanorte.ec", new DemoUser(UUID.fromString("00000000-0000-0000-0000-000000000001"), "Administrador General", "admin"));
        DEMO_USERS.put("operador.demo@rutanorte.ec", new DemoUser(UUID.fromString("00000000-0000-0000-0000-000000000002"), "Operador de Flota", "operator"));
        DEMO_USERS.put("vendedor.demo@rutanorte.ec", new DemoUser(UUID.fromString("00000000-0000-0000-0000-000000000003"), "Vendedor de Taquilla", "seller"));
        DEMO_USERS.put("inspector.demo@rutanorte.ec", new DemoUser(UUID.fromString("00000000-0000-0000-0000-000000000004"), "Inspector de Andén", "inspector"));
        DEMO_USERS.put("pasajero.demo@rutanorte.ec", new DemoUser(UUID.fromString("00000000-0000-0000-0000-000000000005"), "Pasajero Frecuente", "passenger"));
    }

    public AuthService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        DemoUser user = DEMO_USERS.get(email);

        if (user == null && !"DemoPassword2026!".equals(request.getPassword())) {
            // Usuario dinámico genérico para pruebas
            user = new DemoUser(UUID.randomUUID(), email.split("@")[0], "passenger");
        } else if (user == null) {
            throw new BadRequestException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user.id, email, user.role, user.fullName);

        return new AuthResponse(
                token,
                user.id,
                email,
                user.fullName,
                user.role
        );
    }

    private static class DemoUser {
        final UUID id;
        final String fullName;
        final String role;

        DemoUser(UUID id, String fullName, String role) {
            this.id = id;
            this.fullName = fullName;
            this.role = role;
        }
    }
}
