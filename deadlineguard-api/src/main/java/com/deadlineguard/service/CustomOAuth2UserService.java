package com.deadlineguard.service;

import com.deadlineguard.entity.User;
import com.deadlineguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Called after GitHub/Google returns the user profile.
 * Syncs the OAuth2 user to our User table (create-or-update).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        String effectiveEmail = null;
        String effectiveName = null;

        if ("github".equals(registrationId)) {
            String login = oAuth2User.getAttribute("login");
            String name  = oAuth2User.getAttribute("name");
            String email = oAuth2User.getAttribute("email");
            effectiveEmail = (email != null && !email.isEmpty()) ? email : login + "@github.com";
            effectiveName = (name != null && !name.isEmpty()) ? name : login;
        } else if ("google".equals(registrationId)) {
            effectiveEmail = oAuth2User.getAttribute("email");
            effectiveName  = oAuth2User.getAttribute("name");
        }

        if (effectiveEmail == null) {
            effectiveEmail = "unknown@example.com";
        }
        if (effectiveName == null) {
            effectiveName = "Unknown User";
        }

        // Create or update the User entity
        User user = userRepo.findByEmail(effectiveEmail).orElse(null);
        if (user == null) {
            user = User.builder()
                .name(effectiveName)
                .email(effectiveEmail)
                .energyPattern(User.EnergyPattern.MORNING)
                .build();
            log.info("New {} user registered: {} ({})", registrationId, effectiveName, effectiveEmail);
        } else {
            user.setName(effectiveName); // keep display name fresh
        }
        userRepo.save(user);

        return oAuth2User;
    }
}
