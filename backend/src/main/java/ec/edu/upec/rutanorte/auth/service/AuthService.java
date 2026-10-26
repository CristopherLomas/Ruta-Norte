package ec.edu.upec.rutanorte.auth.service;

import ec.edu.upec.rutanorte.auth.dto.AuthResponse;
import ec.edu.upec.rutanorte.auth.dto.LoginRequest;
import ec.edu.upec.rutanorte.auth.entity.User;
import ec.edu.upec.rutanorte.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        // Soporte de Login Rápido en 1 Clic para demostración académica
        if (request.getQuickRole() != null && !request.getQuickRole().isBlank()) {
            String targetRole = request.getQuickRole().trim().toUpperCase();
            Optional<User> userOpt = userRepository.findFirstByRole(targetRole);
            User user = userOpt.orElseGet(() -> createFallbackDemoUser(targetRole));
            String token = "demo-token-" + user.getRole().toLowerCase() + "-" + UUID.randomUUID().toString().substring(0, 8);
            return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), token);
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es requerido");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con correo: " + request.getEmail()));

        // Validación de contraseña flexible para desarrollo/demo
        boolean passwordMatches = false;
        if (request.getPassword() != null) {
            passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash())
                || request.getPassword().equals(user.getPasswordHash())
                || request.getPassword().equalsIgnoreCase("Admin123!")
                || request.getPassword().equalsIgnoreCase("Staff123!")
                || request.getPassword().equalsIgnoreCase("Pasajero123!");
        }

        if (!passwordMatches) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }

        String token = "jwt-session-" + user.getRole().toLowerCase() + "-" + UUID.randomUUID().toString().substring(0, 8);
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), token);
    }

    private User createFallbackDemoUser(String role) {
        User u = new User();
        u.setRole(role);
        if ("ADMIN".equals(role)) {
            u.setFullName("Administrador General (Demo)");
            u.setEmail("admin@rutanorte.ec");
        } else if ("STAFF".equals(role)) {
            u.setFullName("Taquillero de Estación (Demo)");
            u.setEmail("taquilla@rutanorte.ec");
        } else {
            u.setFullName("Pasajero Frecuente (Demo)");
            u.setEmail("pasajero@rutanorte.ec");
        }
        u.setPasswordHash(passwordEncoder.encode(role + "123!"));
        return userRepository.save(u);
    }
}
