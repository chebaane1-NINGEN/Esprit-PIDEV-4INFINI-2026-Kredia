package com.kredia.auth;

import com.kredia.user.entity.User;
import com.kredia.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public OAuth2AuthenticationSuccessHandler(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        
        if (email == null) {
            email = oAuth2User.getAttribute("login") + "@github.com";
        }

        User user = userRepository.findByEmail(email).orElseThrow();

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getUserId());
        extraClaims.put("status", user.getStatus().name());

        String token = jwtService.generateToken(extraClaims, user);

        String targetUrl = determineTargetUrl(user, token);

        if (response.isCommitted()) {
            return;
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String determineTargetUrl(User user, String token) {
        String baseUrl = "/dashboard/";
        String roleSegment = user.getRole().name().toLowerCase();
        
        // Match existing dashboard naming convention
        if ("client".equals(roleSegment)) roleSegment = "client.html";
        else if ("admin".equals(roleSegment)) roleSegment = "admin.html";
        else roleSegment = "employee.html";

        return UriComponentsBuilder.fromUriString(baseUrl + roleSegment)
                .queryParam("token", token)
                .build().toUriString();
    }
}
