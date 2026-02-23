package com.kredia.user.service;

import com.kredia.common.Role;
import com.kredia.common.UserStatus;
import com.kredia.user.dto.UserProfileDTO;
import com.kredia.user.dto.UserResponseDTO;
import com.kredia.user.entity.User;
import com.kredia.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(User user) {
        // Set default values
        user.setStatus(UserStatus.PENDING);
        user.setRole(Role.CLIENT); // Enforce CLIENT role for self-registration
        user.setCreatedAt(LocalDateTime.now());
        
        // Encrypt password
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        return userRepository.save(user);
    }

    @Transactional
    public User createUser(User user) {
        // Default status for created users (can be VERIFIED)
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.VERIFIED);
        }
        if (user.getRole() == null) {
            throw new IllegalArgumentException("Role is required");
        }
        user.setCreatedAt(LocalDateTime.now());
        
        // Encrypt password
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id");
        return userRepository.findById(requiredId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + requiredId));
    }
    
    @Transactional
    public UserResponseDTO updateProfile(Long userId, UserProfileDTO dto) {
        User user = getUserById(Objects.requireNonNull(userId, "userId"));
        
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getZipCode() != null) user.setZipCode(dto.getZipCode());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        
        User savedUser = userRepository.save(user);
        return mapToResponseDTO(savedUser);
    }
    
    @Transactional(readOnly = true)
    public UserResponseDTO getUserProfile(Long userId) {
        return mapToResponseDTO(getUserById(userId));
    }
    
    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = getUserById(userId);
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRole(Long userId, Role role) {
        User user = getUserById(userId);
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password does not match");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .address(user.getAddress())
                .city(user.getCity())
                .zipCode(user.getZipCode())
                .country(user.getCountry())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
