package com.quizapp.repository;

import com.quizapp.model.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    Optional<Analytics> findByQuizId(Long quizId);
} 