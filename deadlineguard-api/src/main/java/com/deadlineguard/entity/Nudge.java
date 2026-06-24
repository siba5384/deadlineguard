package com.deadlineguard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nudges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Nudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonIgnore
    private Task task;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TriggerReason triggerReason = TriggerReason.DEADLINE_APPROACHING;

    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    @Builder.Default
    private boolean dismissed = false;

    // Denormalized fields for quick display without loading the full task join
    @Column(name = "task_title_cache")
    private String taskTitle;

    @Column(name = "task_id_cache")
    private Long taskId;

    public enum TriggerReason {
        DEADLINE_APPROACHING, TASK_UNTOUCHED, HIGH_RISK, CRITICAL_ESCALATION
    }
}
