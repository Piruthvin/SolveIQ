package com.quizapp.controller;

import com.quizapp.dto.LeaderboardResult;
import com.quizapp.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {
    private final LeaderboardService leaderboardService;

    @GetMapping("/daily")
    public ResponseEntity<LeaderboardResult> getDailyLeaderboard(@RequestParam Long userId) {
        return ResponseEntity.ok(leaderboardService.getDailyLeaderboardWithUser(userId));
    }

    @GetMapping("/college")
    public ResponseEntity<LeaderboardResult> getCollegeLeaderboard(@RequestParam String college, @RequestParam Long userId) {
        return ResponseEntity.ok(leaderboardService.getCollegeLeaderboardWithUser(college, userId));
    }
} 