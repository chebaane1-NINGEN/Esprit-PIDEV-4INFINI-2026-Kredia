package com.kredia.service.impl.user;

import com.kredia.dto.auth.LoginRequestDTO;
import com.kredia.dto.auth.RegisterRequestDTO;
import com.kredia.dto.user.UserResponseDTO;
import com.kredia.entity.user.User;
import com.kredia.entity.user.UserStatus;
import com.kredia.entity.user.UserRole;
import com.kredia.exception.BusinessException;
import com.kredia.exception.ResourceNotFoundException;
import com.kredia.mapper.user.UserMapper;
import com.kredia.repository.user.UserRepository;
import com.kredia.security.JwtTokenProvider;
import com.kredia.service.user.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final com.kredia.service.user.EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository, 
                           UserMapper userMapper, 
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider,
                           com.kredia.service.user.EmailService emailService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public UserResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new BusinessException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CLIENT); // Default role for registration
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setEmailVerified(false);
        user.setDeleted(false);
        
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);

        User saved = userRepository.save(user);
        
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFirstName());
        // In a real app, send the actual verification link
        log.info("Verification link for {}: http://localhost:5173/verify-email?token={}", saved.getEmail(), verificationToken);
        
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public String login(LoginRequestDTO request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));

        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new BusinessException("Please verify your email before logging in");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BusinessException("Account is blocked due to too many failed attempts or administrative action");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BusinessException("Account is suspended");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            
            if (attempts >= 3) {
                user.setStatus(UserStatus.BLOCKED);
                emailService.sendSecurityAlert(user.getEmail(), "Account blocked after 3 failed login attempts");
                log.warn("User {} blocked after 3 failed login attempts", user.getEmail());
            }
            
            userRepository.save(user);
            throw new BusinessException("Invalid email or password. Attempt " + attempts + " of 3");
        }

        // Reset failed attempts on successful login
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        return tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BusinessException("Invalid verification token"));

        if (user.isEmailVerified()) {
            throw new BusinessException("Email is already verified");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        String resetToken = UUID.randomUUID().toString();
        user.setVerificationToken(resetToken);
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        log.info("Password reset link for {}: http://localhost:5173/reset-password?token={}", user.getEmail(), resetToken);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BusinessException("Invalid or expired reset token"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setVerificationToken(null);
        user.setFailedLoginAttempts(0); // Reset attempts on manual password reset
        userRepository.save(user);
        
        log.info("Password successfully reset for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void activateUser(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void createAdmin(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(UserRole.ADMIN);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void createAgent(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(UserRole.AGENT);
        userRepository.save(user);
    }
}
