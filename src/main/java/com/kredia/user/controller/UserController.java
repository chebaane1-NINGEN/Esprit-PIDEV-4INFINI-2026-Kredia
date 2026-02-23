package com.kredia.user.controller;

import com.kredia.user.dto.UserProfileDTO;
import com.kredia.user.dto.UserResponseDTO;
import com.kredia.user.entity.User;
import com.kredia.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Objects;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registerUser(@Valid @RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(userService.getUserProfile(savedUser.getUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        User requiredUser = Objects.requireNonNull(user, "user");
        return ResponseEntity.ok(userService.getUserProfile(Objects.requireNonNull(requiredUser.getUserId(), "userId")));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateProfile(@AuthenticationPrincipal User user,
            @RequestBody UserProfileDTO dto) {
        User requiredUser = Objects.requireNonNull(user, "user");
        return ResponseEntity.ok(userService.updateProfile(Objects.requireNonNull(requiredUser.getUserId(), "userId"), dto));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User user,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        User requiredUser = Objects.requireNonNull(user, "user");
        userService.changePassword(Objects.requireNonNull(requiredUser.getUserId(), "userId"), currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }
}
