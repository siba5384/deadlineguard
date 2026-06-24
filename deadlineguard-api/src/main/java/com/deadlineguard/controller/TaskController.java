package com.deadlineguard.controller;

import com.deadlineguard.entity.Subtask;
import com.deadlineguard.entity.Task;
import com.deadlineguard.repository.TaskRepository;
import com.deadlineguard.repository.UserRepository;
import com.deadlineguard.service.RiskScoringService;
import com.deadlineguard.service.TaskDecompositionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import com.deadlineguard.service.GoogleCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;
    private final RiskScoringService riskScoringService;
    private final TaskDecompositionService decompositionService;
    private final GoogleCalendarService googleCalendarService;
    private final OAuth2AuthorizedClientService clientService;

    @GetMapping
    public List<Task> getAllTasks(@RequestParam(defaultValue = "1") Long userId) {
        return taskRepo.findActiveByUserIdOrderByRiskDesc(userId);
    }

    @GetMapping("/all")
    public List<Task> getAllIncludingCompleted(@RequestParam(defaultValue = "1") Long userId) {
        return taskRepo.findByUserIdOrderByRiskScoreDesc(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id) {
        return taskRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskCreateRequest req) {
        com.deadlineguard.entity.User user = userRepo.findById(req.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        Task task = Task.builder()
            .user(user)
            .title(req.getTitle())
            .description(req.getDescription())
            .deadline(req.getDeadline())
            .estimatedEffortMinutes(req.getEstimatedEffortMinutes() != null ? req.getEstimatedEffortMinutes() : 60)
            .importance(req.getImportance() != null ? req.getImportance() : 3)
            .taskType(req.getTaskType() != null ? Task.TaskType.valueOf(req.getTaskType()) : Task.TaskType.GENERAL)
            .status(Task.TaskStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .build();

        task = taskRepo.save(task);

        List<Subtask> subtasks = decompositionService.decomposeAndSave(task);
        task.getSubtasks().addAll(subtasks);

        double score = riskScoringService.calculateScore(task);
        task.setRiskScore(score);
        task.setRiskTier(riskScoringService.toTier(score));
        task = taskRepo.save(task);

        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody TaskUpdateRequest req) {
        return taskRepo.findById(id).map(task -> {
            if (req.getTitle() != null)       task.setTitle(req.getTitle());
            if (req.getDescription() != null) task.setDescription(req.getDescription());
            if (req.getDeadline() != null)    task.setDeadline(req.getDeadline());
            if (req.getStatus() != null)      task.setStatus(Task.TaskStatus.valueOf(req.getStatus()));
            if (req.getImportance() != null)  task.setImportance(req.getImportance());
            if (req.getNotes() != null)       task.setNotes(req.getNotes());

            double score = riskScoringService.calculateScore(task);
            task.setRiskScore(score);
            task.setRiskTier(riskScoringService.toTier(score));
            return ResponseEntity.ok(taskRepo.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<Task> syncToCalendar(@PathVariable Long id, @AuthenticationPrincipal OAuth2User oauth2User) {
        return taskRepo.findById(id).map(task -> {
            if (oauth2User == null) {
                return ResponseEntity.status(401).body(task);
            }
            OAuth2AuthorizedClient client = clientService.loadAuthorizedClient("google", oauth2User.getName());
            if (client == null) {
                return ResponseEntity.status(403).body(task);
            }
            String token = client.getAccessToken().getTokenValue();
            String eventId = googleCalendarService.syncTaskToCalendar(task, token);
            if (eventId != null) {
                task.setCalendarEventId(eventId);
                return ResponseEntity.ok(taskRepo.save(task));
            }
            return ResponseEntity.status(500).body(task);
        }).orElse(ResponseEntity.notFound().build());
    }

    // DTOs as inner classes (Java 8 compatible, no records)
    @Data
    public static class TaskCreateRequest {
        private Long userId;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private Integer estimatedEffortMinutes;
        private Integer importance;
        private String taskType;
    }

    @Data
    public static class TaskUpdateRequest {
        private String title;
        private String description;
        private LocalDateTime deadline;
        private String status;
        private Integer importance;
        private String notes;
    }
}
