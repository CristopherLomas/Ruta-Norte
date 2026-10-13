package ec.edu.upec.rutanorte.controller;

import ec.edu.upec.rutanorte.dto.ApiResponse;
import ec.edu.upec.rutanorte.dto.AuthRequest;
import ec.edu.upec.rutanorte.dto.AuthResponse;
import ec.edu.upec.rutanorte.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints de login y emisión de JWT")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener token JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Inicio de sesión exitoso", response));
    }
}
