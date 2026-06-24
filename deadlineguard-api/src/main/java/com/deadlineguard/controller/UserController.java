package com.deadlineguard.controller;

import com.deadlineguard.entity.User;
import com.deadlineguard.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }

        String email = resolveEmail(auth.getPrincipal());
        return userRepo.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@RequestBody UserUpdateRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("PUT /me called. Auth: " + auth);
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            System.out.println("Returning 401 because not authenticated.");
            return ResponseEntity.status(401).build();
        }

        String email = resolveEmail(auth.getPrincipal());
        System.out.println("Resolved email: " + email);
        
        return userRepo.findByEmail(email).map(user -> {
            System.out.println("User found! Updating...");
            if (req.getName() != null && !req.getName().isEmpty()) {
                user.setName(req.getName());
            }
            if (req.getEnergyPattern() != null && !req.getEnergyPattern().isEmpty()) {
                user.setEnergyPattern(User.EnergyPattern.valueOf(req.getEnergyPattern()));
            }
            if (req.getPassword() != null && !req.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            if (req.getAvatarUrl() != null) {
                user.setAvatarUrl(req.getAvatarUrl());
                System.out.println("Avatar URL updated. Length: " + req.getAvatarUrl().length());
            }
            return ResponseEntity.ok(userRepo.save(user));
        }).orElseGet(() -> {
            System.out.println("User NOT FOUND in database for email: " + email);
            return ResponseEntity.notFound().build();
        });
    }

    private String resolveEmail(Object principal) {
        if (principal instanceof OAuth2User) {
            OAuth2User user = (OAuth2User) principal;
            String email = user.getAttribute("email");
            String login = user.getAttribute("login");
            return (email != null && !email.isEmpty()) ? email : login + "@github.com";
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            return ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        }
        return principal.toString();
    }

    @Data
    public static class UserUpdateRequest {
        private String name;
        private String energyPattern;
        private String password;
        private String avatarUrl;
    }
}
