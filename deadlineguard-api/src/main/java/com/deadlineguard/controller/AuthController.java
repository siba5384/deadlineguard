package com.deadlineguard.controller;

import com.deadlineguard.entity.User;
import com.deadlineguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

/**
 * Authentication endpoints for the React frontend.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email and password required"));
        }
        if (userRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email already in use"));
        }
        User newUser = User.builder()
                .email(email)
                .name(email.contains("@") ? email.split("@")[0] : email)
                .password(passwordEncoder.encode(password))
                .build();
        userRepo.save(newUser);
        return ResponseEntity.ok(Collections.singletonMap("message", "Registration successful"));
    }

    @PostMapping("/demo")
    public ResponseEntity<?> loginAsDemo() {
        User demoUser = userRepo.findByEmail("alex@demo.com").orElse(null);
        if (demoUser == null) {
            return ResponseEntity.status(404).body(Collections.singletonMap("error", "Demo user not found"));
        }
        
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            org.springframework.security.core.userdetails.User
                .withUsername(demoUser.getEmail())
                .password("")
                .authorities("USER")
                .build();
                
        Authentication auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        return ResponseEntity.ok(Collections.singletonMap("message", "Logged in as demo"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401)
                .body(Collections.singletonMap("error", "Not authenticated"));
        }

        String email = resolveEmail(auth.getPrincipal());
        return userRepo.findByEmail(email)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(404)
                .body(Collections.singletonMap("error", "User profile not found")));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.ok(Collections.singletonMap("loggedIn", false));
        }

        String login = resolveLogin(auth.getPrincipal());
        String oauthAvatar = resolveAvatar(auth.getPrincipal());
        String email = resolveEmail(auth.getPrincipal());
        
        User dbUser = userRepo.findByEmail(email).orElse(null);
        Long userId = dbUser != null ? dbUser.getId() : 1L;
        String finalAvatar = (dbUser != null && dbUser.getAvatarUrl() != null && !dbUser.getAvatarUrl().isEmpty()) 
            ? dbUser.getAvatarUrl() : oauthAvatar;

        Map<String, Object> body = new java.util.HashMap<>();
        body.put("loggedIn", true);
        body.put("userId", userId);
        body.put("githubLogin", login);
        body.put("avatarUrl", finalAvatar);
        return ResponseEntity.ok(body);
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

    private String resolveLogin(Object principal) {
        if (principal instanceof OAuth2User) {
            return ((OAuth2User) principal).getAttribute("login");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return email.contains("@") ? email.split("@")[0] : email;
        }
        return null;
    }

    private String resolveAvatar(Object principal) {
        if (principal instanceof OAuth2User) {
            return ((OAuth2User) principal).getAttribute("avatar_url");
        }
        return null;
    }
}
