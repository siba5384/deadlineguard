package com.deadlineguard.controller;

import com.deadlineguard.entity.CheckIn;
import com.deadlineguard.service.CheckInService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping
    public ResponseEntity<CheckInService.CheckInResult> processCheckIn(@RequestBody CheckInRequest req) {
        CheckInService.CheckInResult result = checkInService.processCheckIn(
            req.getUserId(),
            CheckIn.CheckInType.valueOf(req.getType()),
            req.getTranscript()
        );
        return ResponseEntity.ok(result);
    }

    @Data
    public static class CheckInRequest {
        private Long userId;
        private String type;
        private String transcript;
    }
}
