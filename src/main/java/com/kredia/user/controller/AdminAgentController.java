package com.kredia.user.controller;

import com.kredia.common.Role;
import com.kredia.user.dto.UserResponseDTO;
import com.kredia.user.entity.User;
import com.kredia.user.repository.UserRepository;
import com.kredia.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/agents")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAgentController {

    private final UserService userService;
    private final UserRepository userRepository;

    public AdminAgentController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllAgents() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.AGENT || u.getRole() == Role.AUDITOR)
                .map(u -> userService.getUserProfile(u.getUserId()))
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createAgent(@RequestBody User user) {
        if (user.getRole() != Role.AGENT && user.getRole() != Role.AUDITOR) {
            return ResponseEntity.badRequest().build();
        }
        User created = userService.createUser(user);
        return ResponseEntity.ok(userService.getUserProfile(created.getUserId()));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<Void> updateAgentRole(@PathVariable Long id, @RequestBody Role role) {
        if (role != Role.AGENT && role != Role.AUDITOR) {
            return ResponseEntity.badRequest().build();
        }
        userService.updateUserRole(id, role);
        return ResponseEntity.ok().build();
    }
}
