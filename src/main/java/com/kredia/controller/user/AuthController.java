package com.kredia.controller.user;

import com.kredia.dto.ApiResponse;
import com.kredia.dto.auth.AuthResponseDTO;
import com.kredia.dto.auth.LoginRequestDTO;
import com.kredia.dto.auth.RegisterRequestDTO;
import com.kredia.dto.auth.ForgotPasswordRequestDTO;
import com.kredia.dto.auth.ResetPasswordRequestDTO;
import com.kredia.dto.user.UserResponseDTO;
import com.kredia.service.user.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        System.out.println("=== DEBUG LOGIN REQUEST ===");
        System.out.println("Email received: " + request.getEmail());
        System.out.println("Password received: " + request.getPassword());
        System.out.println("Request object: " + request);
        
        try {
            String token = authService.login(request);
            System.out.println("Login successful - Token generated");
            return ResponseEntity.ok(ApiResponse.ok(new AuthResponseDTO(token)));
        } catch (Exception e) {
            System.out.println("Login failed - Error: " + e.getMessage());
            System.out.println("Error type: " + e.getClass().getSimpleName());
            throw e;
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok("Email successfully verified"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Password reset link sent if email exists"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    @PostMapping("/activate-user")
    public ResponseEntity<ApiResponse<String>> activateUser(@RequestBody ForgotPasswordRequestDTO request) {
        authService.activateUser(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("User activated successfully"));
    }

    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse<String>> createAdmin(@RequestBody ForgotPasswordRequestDTO request) {
        authService.createAdmin(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Admin created successfully"));
    }

    @PostMapping("/create-agent")
    public ResponseEntity<ApiResponse<String>> createAgent(@RequestBody ForgotPasswordRequestDTO request) {
        authService.createAgent(request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Agent created successfully"));
    }

    @PostMapping("/test-login")
    public ResponseEntity<String> testLogin(@RequestBody LoginRequestDTO request) {
        System.out.println("=== TEST LOGIN REQUEST ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());
        System.out.println("Request: " + request);
        return ResponseEntity.ok("Request received: " + request.getEmail());
    }
}
