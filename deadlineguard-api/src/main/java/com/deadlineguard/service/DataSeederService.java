package com.deadlineguard.service;

import com.deadlineguard.entity.Nudge;
import com.deadlineguard.entity.Subtask;
import com.deadlineguard.entity.Task;
import com.deadlineguard.entity.User;
import com.deadlineguard.repository.NudgeRepository;
import com.deadlineguard.repository.SubtaskRepository;
import com.deadlineguard.repository.TaskRepository;
import com.deadlineguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Seeds realistic demo data on startup.
 * 6 tasks spanning all 4 risk tiers for an immediate impressive dashboard.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeederService implements CommandLineRunner {

    private final UserRepository userRepo;
    private final TaskRepository taskRepo;
    private final SubtaskRepository subtaskRepo;
    private final NudgeRepository nudgeRepo;
    private final RiskScoringService riskScoringService;

    // Simple DTO (Java 8 compatible, no record)
    private static class SD {
        final String title;
        final int minutes;
        SD(String title, int minutes) { this.title = title; this.minutes = minutes; }
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.findByEmail("alex@demo.com").isPresent()) {
            log.info("Demo user already exists. Skipping data seeding.");
            return;
        }

        log.info("Seeding demo data...");

        User user = userRepo.save(User.builder()
            .name("Alex Johnson")
            .email("alex@demo.com")
            .energyPattern(User.EnergyPattern.MORNING)
            .build());

        LocalDateTime now = LocalDateTime.now();

        // Task 1 - CRITICAL: due in 6 hours
        Task t1 = saveTask(user, "Complete Machine Learning Assignment",
            "Implement a neural network for image classification using PyTorch. Submit via course portal.",
            now.plusHours(6), Task.TaskType.CODING, 5, 120);
        saveSubtasks(t1, Arrays.asList(
            new SD("Set up PyTorch environment", 15),
            new SD("Load and preprocess dataset", 20),
            new SD("Build CNN architecture", 40),
            new SD("Train model and tune hyperparameters", 30),
            new SD("Evaluate and write report section", 15)
        ));

        // Task 2 - CRITICAL: due in 10 hours (EMAIL)
        Task t2 = saveTask(user, "Email Professor About Assignment Extension",
            "Request a 2-day extension for the DSA project due to illness.",
            now.plusHours(10), Task.TaskType.EMAIL, 4, 30);
        saveSubtasks(t2, Arrays.asList(
            new SD("Draft key points for the email", 10),
            new SD("Write email draft", 15),
            new SD("Review and send", 5)
        ));

        // Task 3 - HIGH: due in 1.5 days
        Task t3 = saveTask(user, "Study for Algorithms Midterm",
            "Covers graph algorithms, dynamic programming, and greedy methods. Chapters 15-22.",
            now.plusHours(36), Task.TaskType.STUDY, 5, 180);
        saveSubtasks(t3, Arrays.asList(
            new SD("Review lecture notes on graph algorithms", 40),
            new SD("Summarize dynamic programming patterns", 35),
            new SD("Work through 10 practice problems", 50),
            new SD("Take timed mock exam", 45),
            new SD("Review weak areas", 30)
        ));

        // Task 4 - MEDIUM: due in 3 days
        Task t4 = saveTask(user, "Write Chemistry Lab Report",
            "Document findings from the acid-base titration experiment. APA format, 8-10 pages.",
            now.plusDays(3), Task.TaskType.DOCUMENT, 3, 150);
        saveSubtasks(t4, Arrays.asList(
            new SD("Review experiment notes and raw data", 25),
            new SD("Write introduction and hypothesis", 30),
            new SD("Write methods and results sections", 45),
            new SD("Write discussion and conclusion", 35),
            new SD("Format references and proofread", 15)
        ));
        // Mark first subtask done
        if (!t4.getSubtasks().isEmpty()) {
            t4.getSubtasks().get(0).setCompleted(true);
            t4.getSubtasks().get(0).setCompletedAt(now.minusHours(2));
            subtaskRepo.save(t4.getSubtasks().get(0));
        }

        // Task 5 - MEDIUM: due in 5 days
        Task t5 = saveTask(user, "Prepare Project Presentation",
            "10-minute group presentation on distributed systems. Need slides and speaker notes.",
            now.plusDays(5), Task.TaskType.PRESENTATION, 3, 120);
        saveSubtasks(t5, Arrays.asList(
            new SD("Outline presentation structure", 20),
            new SD("Create slide deck (10 slides)", 50),
            new SD("Add visuals and code snippets", 30),
            new SD("Rehearse with group members", 25),
            new SD("Final polish", 15)
        ));

        // Task 6 - LOW: due in 9 days
        Task t6 = saveTask(user, "Read Textbook Chapters 7-10",
            "Chapters on database normalization, SQL joins, and transactions. Take notes.",
            now.plusDays(9), Task.TaskType.STUDY, 2, 90);
        saveSubtasks(t6, Arrays.asList(
            new SD("Read Chapter 7 - Normalization", 25),
            new SD("Read Chapter 8 - SQL Joins", 20),
            new SD("Read Chapter 9 - Transactions", 22),
            new SD("Read Chapter 10 - Indexing", 23)
        ));

        // Compute risk scores
        scoreAndSave(t1); scoreAndSave(t2); scoreAndSave(t3);
        scoreAndSave(t4); scoreAndSave(t5); scoreAndSave(t6);

        // Seed one live critical nudge
        nudgeRepo.save(Nudge.builder()
            .user(user)
            .task(t1)
            .taskId(t1.getId())
            .taskTitle(t1.getTitle())
            .message("Critical: \"Complete Machine Learning Assignment\" is due in 6 hours! " +
                "Your next step is \"Set up PyTorch environment\" - it only takes 15 minutes. Start now!")
            .triggerReason(Nudge.TriggerReason.CRITICAL_ESCALATION)
            .dismissed(false)
            .build());

        log.info("Seeded 1 demo user, 6 tasks, subtasks, and 1 nudge.");
    }

    private Task saveTask(User user, String title, String desc, LocalDateTime deadline,
                          Task.TaskType type, int importance, int effortMins) {
        return taskRepo.save(Task.builder()
            .user(user).title(title).description(desc).deadline(deadline)
            .taskType(type).importance(importance).estimatedEffortMinutes(effortMins)
            .status(Task.TaskStatus.PENDING)
            .build());
    }

    private void saveSubtasks(Task task, List<SD> items) {
        for (int i = 0; i < items.size(); i++) {
            subtaskRepo.save(Subtask.builder()
                .task(task)
                .title(items.get(i).title)
                .estimatedMinutes(items.get(i).minutes)
                .orderIndex(i)
                .completed(false)
                .build());
        }
        task.getSubtasks().addAll(subtaskRepo.findByTaskIdOrderByOrderIndex(task.getId()));
    }

    private void scoreAndSave(Task task) {
        double score = riskScoringService.calculateScore(task);
        task.setRiskScore(score);
        task.setRiskTier(riskScoringService.toTier(score));
        taskRepo.save(task);
    }
}
