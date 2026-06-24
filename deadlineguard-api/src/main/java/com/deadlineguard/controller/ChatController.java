package com.deadlineguard.controller;

import com.deadlineguard.service.ClaudeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ChatController {

    private final ClaudeService claudeService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Message cannot be empty"));
        }
        
        String response = claudeService.chat(message);
        return ResponseEntity.ok(Collections.singletonMap("reply", response));
    }
}
