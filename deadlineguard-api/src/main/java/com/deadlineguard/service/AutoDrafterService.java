package com.deadlineguard.service;

import com.deadlineguard.entity.Task;
import com.deadlineguard.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutoDrafterService {

    private final ClaudeService claudeService;
    private final TaskRepository taskRepo;

    public static class DraftResult {
        private final String draft;
        private final String taskTitle;
        private final String taskType;

        public DraftResult(String draft, String taskTitle, String taskType) {
            this.draft = draft; this.taskTitle = taskTitle; this.taskType = taskType;
        }
        public String getDraft()      { return draft; }
        public String getTaskTitle()  { return taskTitle; }
        public String getTaskType()   { return taskType; }
    }

    public DraftResult generateDraft(Long taskId) {
        Task task = taskRepo.findById(taskId).orElseThrow(() ->
            new IllegalArgumentException("Task not found: " + taskId));
        String draft = claudeService.generateDraft(task.getTitle(), task.getDescription(), task.getTaskType());
        return new DraftResult(draft, task.getTitle(), task.getTaskType().name());
    }
}
