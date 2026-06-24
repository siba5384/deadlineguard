package com.deadlineguard.entity;

import javax.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EnergyPattern energyPattern = EnergyPattern.MORNING;

    // Aggregated stats (updated by PatternDetectionService)
    @Builder.Default
    private double completionRate = 0.0;

    @Builder.Default
    private double avgEffortUnderestimate = 0.0; // percentage e.g. 0.40 means 40% underestimate

    public enum EnergyPattern {
        MORNING, AFTERNOON, EVENING, NIGHT
    }
}
