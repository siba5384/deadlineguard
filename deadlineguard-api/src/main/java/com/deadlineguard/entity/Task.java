package com.deadlineguard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Builder.Default
    private int estimatedEffortMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskType taskType = TaskType.GENERAL;

    // 1 (low) to 5 (critical)
    @Builder.Default
    private int importance = 3;

    // Computed by RiskScoringService
    @Builder.Default
    private double riskScore = 0.0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RiskTier riskTier = RiskTier.LOW;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @Builder.Default
    private List<Subtask> subtasks = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "calendar_event_id")
    private String calendarEventId;

    public enum TaskStatus {
        PENDING, IN_PROGRESS, COMPLETED, MISSED
    }

    public enum TaskType {
        GENERAL, EMAIL, DOCUMENT, CODING, STUDY, PRESENTATION
    }

    public enum RiskTier {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
