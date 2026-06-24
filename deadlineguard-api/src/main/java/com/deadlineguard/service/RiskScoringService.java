package com.deadlineguard.service;

import com.deadlineguard.entity.Subtask;
import com.deadlineguard.entity.Task;
import com.deadlineguard.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Computes priority = 0.35*urgency + 0.25*importance + 0.25*effortRemaining + 0.15*energyFit
 * All components normalized 0-100.
 */
@Service
public class RiskScoringService {

    public double calculateScore(Task task) {
        double urgency       = calculateUrgency(task);
        double importance    = (task.getImportance() / 5.0) * 100.0;
        double effortRemain  = calculateEffortRemaining(task);
        double energyFit     = calculateEnergyFit(task.getUser());

        double score = (0.35 * urgency) + (0.25 * importance) + (0.25 * effortRemain) + (0.15 * energyFit);
        return Math.min(Math.max(score, 0), 100);
    }

    public Task.RiskTier toTier(double score) {
        if (score >= 76) return Task.RiskTier.CRITICAL;
        if (score >= 56) return Task.RiskTier.HIGH;
        if (score >= 31) return Task.RiskTier.MEDIUM;
        return Task.RiskTier.LOW;
    }

    private double calculateUrgency(Task task) {
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), task.getDeadline());
        if (hours <= 0)   return 100;
        if (hours <= 12)  return 95;
        if (hours <= 24)  return 82;
        if (hours <= 48)  return 65;
        if (hours <= 72)  return 48;
        if (hours <= 168) return 28;  // within 1 week
        return 10;
    }

    private double calculateEffortRemaining(Task task) {
        List<Subtask> subtasks = task.getSubtasks();
        if (subtasks == null || subtasks.isEmpty()) {
            int est = task.getEstimatedEffortMinutes();
            return Math.min((est / 120.0) * 100.0, 100.0);
        }
        int total     = subtasks.stream().mapToInt(Subtask::getEstimatedMinutes).sum();
        int remaining = subtasks.stream().filter(s -> !s.isCompleted()).mapToInt(Subtask::getEstimatedMinutes).sum();
        if (total == 0) return 0;
        return (remaining / (double) total) * 100.0;
    }

    /** Higher score = harder to fit into current energy window (i.e. more risky to procrastinate) */
    private double calculateEnergyFit(User user) {
        int hour = LocalDateTime.now().getHour();
        User.EnergyPattern pattern = user != null ? user.getEnergyPattern() : User.EnergyPattern.MORNING;
        boolean inPeakWindow;
        if (pattern == User.EnergyPattern.MORNING) {
            inPeakWindow = hour >= 7 && hour <= 11;
        } else if (pattern == User.EnergyPattern.AFTERNOON) {
            inPeakWindow = hour >= 13 && hour <= 17;
        } else if (pattern == User.EnergyPattern.EVENING) {
            inPeakWindow = hour >= 18 && hour <= 22;
        } else { // NIGHT
            inPeakWindow = hour >= 21 || hour <= 2;
        }
        return inPeakWindow ? 40.0 : 75.0;
    }
}
