package com.deadlineguard.controller;

import com.deadlineguard.service.AutoDrafterService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drafts")
@RequiredArgsConstructor
public class DraftController {

    private final AutoDrafterService autoDrafterService;

    @PostMapping
    public ResponseEntity<AutoDrafterService.DraftResult> generateDraft(@RequestBody DraftRequest req) {
        return ResponseEntity.ok(autoDrafterService.generateDraft(req.getTaskId()));
    }

    @Data
    public static class DraftRequest {
        private Long taskId;
    }
}
