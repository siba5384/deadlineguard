package com.deadlineguard.repository;

import com.deadlineguard.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserIdOrderByRiskScoreDesc(Long userId);

    List<Task> findByUserIdAndStatusOrderByRiskScoreDesc(Long userId, Task.TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.status NOT IN ('COMPLETED', 'MISSED') ORDER BY t.riskScore DESC")
    List<Task> findActiveByUserIdOrderByRiskDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t WHERE t.status NOT IN ('COMPLETED', 'MISSED')")
    List<Task> findAllActive();
}
