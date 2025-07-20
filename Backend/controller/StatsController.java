package com.quizapp.controller;

import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserQuizAttemptRepository;
import com.quizapp.model.UserQuizAttempt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private UserQuizAttemptRepository userQuizAttemptRepository;

    @GetMapping("/home")
    public Map<String, Object> getHomeStats(@RequestParam Long userId) {
        Map<String, Object> stats = new HashMap<>();
        // Total quizzes
        long totalQuizzes = quizRepository.count();
        stats.put("totalQuizzes", totalQuizzes);

        // Solved quizzes by user
        long solved = userQuizAttemptRepository.findByUserId(userId)
            .stream().filter(UserQuizAttempt::isSolved).count();
        stats.put("solved", solved);

        // Distinct topics
        List<String> topics = quizRepository.findAll().stream()
            .map(quiz -> quiz.getTopic())
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        stats.put("topics", topics);
        stats.put("topicsCount", topics.size());

        return stats;
    }
} 