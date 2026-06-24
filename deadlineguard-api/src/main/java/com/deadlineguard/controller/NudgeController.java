package com.deadlineguard.controller;

import com.deadlineguard.entity.Nudge;
import com.deadlineguard.service.NudgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nudges")
@RequiredArgsConstructor
public class NudgeController {

    private final NudgeService nudgeService;

    @GetMapping
    public List<Nudge> getActive(@RequestParam(defaultValue = "1") Long userId) {
        return nudgeService.getActiveNudges(userId);
    }

    @PostMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismiss(@PathVariable Long id) {
        nudgeService.dismiss(id);
        return ResponseEntity.ok().build();
    }
}
