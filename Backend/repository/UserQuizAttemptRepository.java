package com.quizapp.repository;

import com.quizapp.model.UserQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserQuizAttemptRepository extends JpaRepository<UserQuizAttempt, Long> {
    List<UserQuizAttempt> findByUserId(Long userId);
    boolean existsByUserIdAndQuizId(Long userId, Long quizId);
} 