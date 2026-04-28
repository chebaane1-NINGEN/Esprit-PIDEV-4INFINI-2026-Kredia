package com.kredia.dto.auth;

import com.kredia.dto.user.UserResponseDTO;

public class AuthResponseDTO {

    private UserResponseDTO user;
    private String token;
    private String type = "Bearer";

    public AuthResponseDTO(String token, UserResponseDTO user) {
        this.token = token;
        this.user = user;
    }

    public UserResponseDTO getUser() { return user; }
    public void setUser(UserResponseDTO user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
