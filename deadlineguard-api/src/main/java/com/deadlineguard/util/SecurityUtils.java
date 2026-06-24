package com.deadlineguard.util;

import com.deadlineguard.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Helper to resolve the authenticated user's DB id from the Spring Security context.
 * Falls back to 1L (demo user) when running without auth (e.g. tests, H2 console).
 */
public class SecurityUtils {

    private SecurityUtils() {}

    public static Long getCurrentUserId(UserRepository userRepo) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return 1L;
        if (!(auth.getPrincipal() instanceof OAuth2User)) return 1L;

        OAuth2User principal = (OAuth2User) auth.getPrincipal();
        String email = principal.getAttribute("email");
        String login = principal.getAttribute("login");
        String effectiveEmail = (email != null && !email.isEmpty()) ? email : login + "@github.com";

        return userRepo.findByEmail(effectiveEmail)
            .map(u -> u.getId())
            .orElse(1L);
    }
}
