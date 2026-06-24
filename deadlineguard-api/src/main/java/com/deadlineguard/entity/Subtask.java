package com.deadlineguard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "subtasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnore
    private Task task;

    @Column(nullable = false)
    private String title;

    @Builder.Default
    private int estimatedMinutes = 15;

    // When this subtask is scheduled (null = unscheduled)
    private LocalDateTime scheduledSlot;

    @Builder.Default
    private boolean completed = false;

    private LocalDateTime completedAt;

    @Builder.Default
    private int orderIndex = 0;
}
