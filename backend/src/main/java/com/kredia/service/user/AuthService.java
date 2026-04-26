package com.kredia.service.user;

import com.kredia.dto.auth.AuthResponseDTO;

public interface AuthService {
    UserResponseDTO register(RegisterRequestDTO request);
    AuthResponseDTO login(LoginRequestDTO request);
    String loginWithGoogle(String idToken);
    void verifyEmail(String token);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}
