package com.deadlineguard.config;

import com.deadlineguard.service.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import com.deadlineguard.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import javax.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.auth.success-url}")
    private String successUrl;

    @Value("${app.auth.failure-url}")
    private String failureUrl;

    // ── Handlers ──────────────────────────────────────────────────────────

    @Bean
    public AuthenticationSuccessHandler oauth2SuccessHandler() {
        return (request, response, authentication) ->
            response.sendRedirect(successUrl);
    }

    @Bean
    public AuthenticationFailureHandler oauth2FailureHandler() {
        return (request, response, exception) ->
            response.sendRedirect(failureUrl);
    }

    @Bean
    public LogoutSuccessHandler logoutSuccessHandler() {
        return (request, response, authentication) -> {
            // Return 200 JSON instead of redirect — React frontend handles navigation
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Logged out\"}");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return email -> {
            com.deadlineguard.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .authorities("USER")
                .build();
        };
    }

    // ── Security Filter Chain ─────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS and disable CSRF
            .cors().and()
            .csrf().disable()

            // Allow framing for H2 console
            .headers().frameOptions().sameOrigin()
            .and()

            // Route access rules
            .authorizeRequests()
                // Public: H2 console, auth endpoints, OAuth2 flow URLs
                .antMatchers(
                    "/h2-console/**",
                    "/api/auth/**",
                    "/login/**",
                    "/oauth2/**",
                    "/error"
                ).permitAll()
                // Everything else needs GitHub login
                .antMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            .and()

            // Email / Password Form Login
            .formLogin()
                .loginProcessingUrl("/api/auth/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Logged in\"}");
                })
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Invalid credentials\"}");
                })
            .and()

            // OAuth2 login (GitHub & Google)
            .oauth2Login()
                .userInfoEndpoint()
                    .userService(customOAuth2UserService)
                .and()
                .successHandler(oauth2SuccessHandler())
                .failureHandler(oauth2FailureHandler())
            .and()

            // Logout
            .logout()
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(logoutSuccessHandler())
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .clearAuthentication(true)
            .and()
            
            // Return 401 instead of 302 redirect for unauthenticated API requests
            .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthenticated\"}");
                });

        return http.build();
    }
}
