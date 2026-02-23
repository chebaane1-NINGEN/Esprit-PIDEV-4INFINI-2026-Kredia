package com.kredia.user.controller;

import com.kredia.common.Role;
import com.kredia.common.UserStatus;
import com.kredia.user.dto.UserResponseDTO;
import com.kredia.user.entity.User;
import com.kredia.user.repository.UserRepository;
import com.kredia.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public AdminUserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search) {
        
        List<User> users = userRepository.findAll();
        
        return ResponseEntity.ok(users.stream()
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> status == null || u.getStatus() == status)
                .filter(u -> search == null || 
                         (u.getFirstName() + " " + u.getLastName()).toLowerCase().contains(search.toLowerCase()) ||
                         u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .map(u -> userService.getUserProfile(u.getUserId()))
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createEmployee(@RequestBody User user) {
        // Only allow creating AGENT or AUDITOR accounts
        if (user.getRole() != Role.AGENT && user.getRole() != Role.AUDITOR) {
            return ResponseEntity.badRequest().build();
        }
        User created = userService.createUser(user);
        return ResponseEntity.ok(userService.getUserProfile(created.getUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Long requiredId = Objects.requireNonNull(id, "id");
        if (!userRepository.existsById(requiredId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(requiredId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody UserStatus status) {
        userService.updateUserStatus(Objects.requireNonNull(id, "id"), status);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Void> updateRole(@PathVariable Long id, @RequestBody Role role) {
        userService.updateUserRole(Objects.requireNonNull(id, "id"), role);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody String newPassword) {
        userService.resetPassword(Objects.requireNonNull(id, "id"), newPassword);
        return ResponseEntity.ok().build();
    }
}
