package com.deadlineguard.controller;

import com.deadlineguard.entity.User;
import com.deadlineguard.repository.UserRepository;
import com.deadlineguard.scheduler.RiskEngineScheduler;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminController {

    private final RiskEngineScheduler scheduler;
    private final UserRepository userRepo;

    @PostMapping("/admin/trigger-risk-engine")
    public ResponseEntity<Map<String, String>> triggerRiskEngine() {
        scheduler.recalculateAllRiskScores();
        return ResponseEntity.ok(Collections.singletonMap("status", "Risk engine recalculated successfully"));
    }

}
