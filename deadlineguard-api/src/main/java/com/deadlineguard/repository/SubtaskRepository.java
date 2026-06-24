package com.deadlineguard.repository;

import com.deadlineguard.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByTaskIdOrderByOrderIndex(Long taskId);
    long countByTaskIdAndCompletedTrue(Long taskId);
    long countByTaskId(Long taskId);
}
