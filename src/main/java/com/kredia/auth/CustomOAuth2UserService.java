package com.kredia.auth;

import com.kredia.common.Role;
import com.kredia.user.entity.User;
import com.kredia.common.UserStatus;
import com.kredia.user.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = "";
        String firstName = "";
        String lastName = "";

        if ("google".equals(registrationId)) {
            email = (String) attributes.get("email");
            firstName = (String) attributes.get("given_name");
            lastName = (String) attributes.get("family_name");
        } else if ("github".equals(registrationId)) {
            email = (String) attributes.get("email");
            if (email == null) {
                // GitHub might have null email if private, handling logic here
                email = (String) attributes.get("login") + "@github.com";
            }
            String name = (String) attributes.get("name");
            if (name != null) {
                String[] parts = name.split(" ", 2);
                firstName = parts[0];
                lastName = parts.length > 1 ? parts[1] : "";
            } else {
                firstName = (String) attributes.get("login");
            }
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            registerNewOAuth2User(email, firstName, lastName);
        }

        return oAuth2User;
    }

    private User registerNewOAuth2User(String email, String firstName, String lastName) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(Role.CLIENT);
        user.setStatus(UserStatus.PENDING);
        user.setCreatedAt(LocalDateTime.now());
        // Password not needed for OAuth users as they authenticate via provider
        user.setPasswordHash("OAUTH2_USER"); 
        return userRepository.save(user);
    }
}
