package com.deadlineguard.controller;

import com.deadlineguard.service.PatternDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightController {

    private final PatternDetectionService patternDetectionService;

    @GetMapping
    public List<PatternDetectionService.Insight> getInsights(@RequestParam(defaultValue = "1") Long userId) {
        return patternDetectionService.detectPatterns(userId);
    }
}
