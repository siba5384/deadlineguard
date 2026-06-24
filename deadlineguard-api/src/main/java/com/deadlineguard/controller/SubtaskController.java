package com.deadlineguard.controller;

import com.deadlineguard.entity.Subtask;
import com.deadlineguard.repository.SubtaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskRepository subtaskRepo;

    @GetMapping("/tasks/{taskId}/subtasks")
    public List<Subtask> getSubtasks(@PathVariable Long taskId) {
        return subtaskRepo.findByTaskIdOrderByOrderIndex(taskId);
    }

    @PatchMapping("/subtasks/{id}/complete")
    public ResponseEntity<Subtask> complete(@PathVariable Long id) {
        return subtaskRepo.findById(id).map(s -> {
            s.setCompleted(true);
            s.setCompletedAt(LocalDateTime.now());
            return ResponseEntity.ok(subtaskRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/subtasks/{id}/uncomplete")
    public ResponseEntity<Subtask> uncomplete(@PathVariable Long id) {
        return subtaskRepo.findById(id).map(s -> {
            s.setCompleted(false);
            s.setCompletedAt(null);
            return ResponseEntity.ok(subtaskRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }
}
