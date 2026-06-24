package com.deadlineguard.service;

import com.deadlineguard.entity.CheckIn;
import com.deadlineguard.entity.Task;
import com.deadlineguard.entity.User;
import com.deadlineguard.repository.CheckInRepository;
import com.deadlineguard.repository.TaskRepository;
import com.deadlineguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {

    private final ClaudeService claudeService;
    private final CheckInRepository checkInRepo;
    private final TaskRepository taskRepo;
    private final UserRepository userRepo;
    private final TaskDecompositionService decompositionService;
    private final RiskScoringService riskScoringService;

    public static class CheckInResult {
        private final CheckIn checkIn;
        private final List<Task> createdTasks;
        public CheckInResult(CheckIn checkIn, List<Task> createdTasks) {
            this.checkIn = checkIn; this.createdTasks = createdTasks;
        }
        public CheckIn getCheckIn()         { return checkIn; }
        public List<Task> getCreatedTasks() { return createdTasks; }
    }

    @Transactional
    public CheckInResult processCheckIn(Long userId, CheckIn.CheckInType type, String transcript) {
        User user = userRepo.findById(userId).orElseThrow(
            () -> new IllegalArgumentException("User not found: " + userId));
        List<ClaudeService.ParsedTask> parsed = claudeService.parseCheckIn(transcript);
        List<Task> created = new ArrayList<>();

        for (ClaudeService.ParsedTask pt : parsed) {
            Task.TaskType taskType;
            try { taskType = Task.TaskType.valueOf(pt.getType()); }
            catch (Exception e) { taskType = Task.TaskType.GENERAL; }

            Task task = Task.builder()
                .user(user)
                .title(pt.getTitle())
                .deadline(defaultDeadline(type))
                .estimatedEffortMinutes(pt.getEstimatedMinutes())
                .taskType(taskType)
                .importance(3)
                .status(Task.TaskStatus.PENDING)
                .build();
            task = taskRepo.save(task);
            decompositionService.decomposeAndSave(task);
            double score = riskScoringService.calculateScore(task);
            task.setRiskScore(score);
            task.setRiskTier(riskScoringService.toTier(score));
            created.add(taskRepo.save(task));
        }

        CheckIn checkIn = CheckIn.builder()
            .user(user).type(type).transcript(transcript)
            .extractedTaskCount(created.size()).checkinAt(LocalDateTime.now())
            .build();
        return new CheckInResult(checkInRepo.save(checkIn), created);
    }

    private LocalDateTime defaultDeadline(CheckIn.CheckInType type) {
        LocalDateTime now = LocalDateTime.now();
        switch (type) {
            case MORNING: case MIDDAY: return now.withHour(23).withMinute(59);
            case EVENING: return now.plusDays(1).withHour(23).withMinute(59);
            default: return now.plusDays(1).withHour(23).withMinute(59);
        }
    }
}
