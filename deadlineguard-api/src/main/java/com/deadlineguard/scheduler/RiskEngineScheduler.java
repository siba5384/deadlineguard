package com.deadlineguard.scheduler;

import com.deadlineguard.entity.Nudge;
import com.deadlineguard.entity.Task;
import com.deadlineguard.repository.TaskRepository;
import com.deadlineguard.service.NudgeService;
import com.deadlineguard.service.RiskScoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RiskEngineScheduler {

    private final TaskRepository taskRepo;
    private final RiskScoringService riskScoringService;
    private final NudgeService nudgeService;

    /** Runs every 30 minutes. Also callable manually via /api/admin/trigger-risk-engine */
    @Scheduled(fixedDelay = 1_800_000, initialDelay = 60_000)
    @Transactional
    public void recalculateAllRiskScores() {
        List<Task> active = taskRepo.findAllActive();
        log.info("Risk engine: recalculating {} active tasks", active.size());

        for (Task task : active) {
            Task.RiskTier previousTier = task.getRiskTier();
            double score = riskScoringService.calculateScore(task);
            Task.RiskTier newTier = riskScoringService.toTier(score);

            task.setRiskScore(score);
            task.setRiskTier(newTier);
            taskRepo.save(task);

            // Fire nudge if crossed into HIGH or CRITICAL
            boolean escalated = (newTier == Task.RiskTier.HIGH && previousTier == Task.RiskTier.MEDIUM)
                || (newTier == Task.RiskTier.CRITICAL && previousTier != Task.RiskTier.CRITICAL);

            if (escalated || newTier == Task.RiskTier.CRITICAL) {
                Nudge.TriggerReason reason = newTier == Task.RiskTier.CRITICAL
                    ? Nudge.TriggerReason.CRITICAL_ESCALATION
                    : Nudge.TriggerReason.HIGH_RISK;
                nudgeService.createNudge(task.getUser(), task, reason);
            }
        }
        log.info("Risk engine: done");
    }
}
