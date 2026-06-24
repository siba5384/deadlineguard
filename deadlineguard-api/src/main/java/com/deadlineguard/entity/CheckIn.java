package com.deadlineguard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_ins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckInType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String transcript;

    @Builder.Default
    private int extractedTaskCount = 0;

    @Builder.Default
    private LocalDateTime checkinAt = LocalDateTime.now();

    public enum CheckInType {
        MORNING, MIDDAY, EVENING
    }
}
