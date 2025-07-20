package com.quizapp.repository;

import com.quizapp.model.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    List<Leaderboard> findByDate(LocalDate date);
    List<Leaderboard> findByCollege(String college);
} 