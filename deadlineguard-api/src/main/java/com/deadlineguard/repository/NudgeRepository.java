package com.deadlineguard.repository;

import com.deadlineguard.entity.Nudge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NudgeRepository extends JpaRepository<Nudge, Long> {
    List<Nudge> findByUserIdAndDismissedFalseOrderBySentAtDesc(Long userId);
    List<Nudge> findByUserIdOrderBySentAtDesc(Long userId);
    long countByTaskIdAndDismissedFalse(Long taskId);
}
