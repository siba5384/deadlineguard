package com.deadlineguard.service;

import com.deadlineguard.entity.Nudge;
import com.deadlineguard.entity.Subtask;
import com.deadlineguard.entity.Task;
import com.deadlineguard.entity.User;
import com.deadlineguard.repository.NudgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NudgeService {

    private final NudgeRepository nudgeRepository;
    private final ClaudeService claudeService;

    @Transactional
    public Nudge createNudge(User user, Task task, Nudge.TriggerReason reason) {
        // Avoid spamming: skip if undismissed nudge exists for this task
        if (nudgeRepository.countByTaskIdAndDismissedFalse(task.getId()) > 0) {
            return null;
        }

        long hoursLeft = ChronoUnit.HOURS.between(LocalDateTime.now(), task.getDeadline());
        String nextSubtask = task.getSubtasks().stream()
            .filter(s -> !s.isCompleted())
            .findFirst()
            .map(Subtask::getTitle)
            .orElse("next step");

        String message = claudeService.generateNudge(task.getTitle(), task.getRiskScore(), nextSubtask, hoursLeft);

        Nudge nudge = Nudge.builder()
            .user(user)
            .task(task)
            .taskId(task.getId())
            .taskTitle(task.getTitle())
            .message(message)
            .triggerReason(reason)
            .sentAt(LocalDateTime.now())
            .dismissed(false)
            .build();

        log.info("Creating nudge for task [{}] reason={}", task.getId(), reason);
        return nudgeRepository.save(nudge);
    }

    public List<Nudge> getActiveNudges(Long userId) {
        return nudgeRepository.findByUserIdAndDismissedFalseOrderBySentAtDesc(userId);
    }

    @Transactional
    public void dismiss(Long nudgeId) {
        nudgeRepository.findById(nudgeId).ifPresent(n -> {
            n.setDismissed(true);
            nudgeRepository.save(n);
        });
    }
}
