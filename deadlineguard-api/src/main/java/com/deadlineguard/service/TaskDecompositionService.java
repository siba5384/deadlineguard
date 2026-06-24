package com.deadlineguard.service;

import com.deadlineguard.entity.Subtask;
import com.deadlineguard.entity.Task;
import com.deadlineguard.repository.SubtaskRepository;
import com.deadlineguard.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskDecompositionService {

    private final ClaudeService claudeService;
    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public List<Subtask> decomposeAndSave(Task task) {
        log.info("Decomposing task [{}] '{}'", task.getId(), task.getTitle());

        List<ClaudeService.SubtaskData> subtaskData =
            claudeService.decomposeTask(task.getTitle(), task.getDescription(), task.getTaskType());

        AtomicInteger index = new AtomicInteger(0);
        List<Subtask> subtasks = subtaskData.stream()
            .map(sd -> Subtask.builder()
                .task(task)
                .title(sd.getTitle())
                .estimatedMinutes(sd.getEstimatedMinutes())
                .orderIndex(index.getAndIncrement())
                .completed(false)
                .build())
            .collect(Collectors.toList());

        subtaskRepository.saveAll(subtasks);
        log.info("Saved {} subtasks for task [{}]", subtasks.size(), task.getId());
        return subtasks;
    }
}
