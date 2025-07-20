package com.quizapp.controller;

import com.quizapp.dto.QuizCreateRequest;
import com.quizapp.dto.QuizResponse;
import com.quizapp.dto.QuizSubmitRequest;
import com.quizapp.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.quizapp.model.UserQuizAttempt;
import com.quizapp.repository.UserQuizAttemptRepository;
import com.quizapp.model.Quiz;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import com.quizapp.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;

    @Autowired
    private UserQuizAttemptRepository userQuizAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody QuizCreateRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    // Add this endpoint for daily quiz
    @GetMapping("/daily")
    public ResponseEntity<QuizResponse> getDailyQuiz(@RequestParam Long userId) {
        return ResponseEntity.ok(quizService.getDailyQuiz(userId));
    }

    // Restrict {id} to only match numbers
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<QuizResponse> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuiz(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<QuizResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/solved")
    public ResponseEntity<List<SolvedQuizDTO>> getSolvedQuizzes(@RequestParam Long userId) {
        List<UserQuizAttempt> attempts = userQuizAttemptRepository.findByUserId(userId);
        List<SolvedQuizDTO> solved = attempts.stream()
            .filter(UserQuizAttempt::isSolved)
            .map(a -> new SolvedQuizDTO(
                a.getQuiz().getId(),
                a.getQuiz().getTopic(), // Use topic for title
                a.getQuiz().getTopic(), // Use topic for topic
                null, // No score field
                null, // No dateSolved field
                a.getQuiz().getKnowledgeLevel() != null ? a.getQuiz().getKnowledgeLevel().name() : null
            ))
            .toList();
        return ResponseEntity.ok(solved);
    }

    @GetMapping("/list")
    public List<Map<String, Object>> getQuizList(@RequestParam Long userId, @RequestParam(required = false) String topic, @RequestParam(required = false) String knowledgeLevel) {
        List<Quiz> quizzes = quizService.getAllQuizEntities();
        if (topic != null && !topic.isEmpty()) {
            quizzes = quizzes.stream().filter(q -> q.getTopic().equals(topic)).collect(Collectors.toList());
        }
        if (knowledgeLevel != null && !knowledgeLevel.isEmpty()) {
            quizzes = quizzes.stream().filter(q -> q.getKnowledgeLevel() != null && q.getKnowledgeLevel().name().equalsIgnoreCase(knowledgeLevel)).collect(Collectors.toList());
        }
        List<UserQuizAttempt> attempts = userQuizAttemptRepository.findByUserId(userId);
        Set<Long> solvedQuizIds = attempts.stream()
            .filter(UserQuizAttempt::isSolved)
            .map(a -> a.getQuiz().getId())
            .collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();
        int questionNumber = 1;
        for (Quiz quiz : quizzes) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", quiz.getId());
            map.put("questionNumber", questionNumber++);
            map.put("question", quiz.getQuestion());
            map.put("topic", quiz.getTopic());
            map.put("knowledgeLevel", quiz.getKnowledgeLevel() != null ? quiz.getKnowledgeLevel().name() : "");
            map.put("option1", quiz.getOption1());
            map.put("option2", quiz.getOption2());
            map.put("option3", quiz.getOption3());
            map.put("option4", quiz.getOption4());
            map.put("status", solvedQuizIds.contains(quiz.getId()) ? "Solved" : "Unsolved");
            result.add(map);
        }
        return result;
    }

    public static class SolvedQuizDTO {
        public Long quizId;
        public String title;
        public String topic;
        public Integer score;
        public String dateSolved;
        public String difficulty;
        public SolvedQuizDTO(Long quizId, String title, String topic, Integer score, String dateSolved, String difficulty) {
            this.quizId = quizId;
            this.title = title;
            this.topic = topic;
            this.score = score;
            this.dateSolved = dateSolved;
            this.difficulty = difficulty;
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitQuiz(@RequestBody QuizSubmitRequest request) {
        // Returns a string result (e.g., score or status)
        return ResponseEntity.ok(quizService.submitQuiz(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizResponse> updateQuiz(@PathVariable Long id, @RequestBody QuizCreateRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/attempt")
    public ResponseEntity<Void> markQuizAttempted(@RequestParam Long userId, @RequestParam Long quizId, @RequestParam boolean solved) {
        quizService.markQuizAttempted(userId, quizId, solved);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/is-solved")
    public ResponseEntity<Boolean> hasUserSolvedQuiz(@RequestParam Long userId, @RequestParam Long quizId) {
        boolean solved = quizService.hasUserSolvedQuiz(userId, quizId);
        return ResponseEntity.ok(solved);
    }

    @GetMapping("/debug-streak")
    public Map<String, Object> debugStreak(@RequestParam Long userId) {
        com.quizapp.model.User user = userRepository.findById(userId).orElse(null);
        Map<String, Object> debug = new HashMap<>();
        
        if (user != null) {
            debug.put("userId", userId);
            debug.put("currentStreak", user.getCurrentStreak());
            debug.put("totalQuizzesSolved", user.getTotalQuizzesSolved());
            debug.put("daysActive", user.getDaysActive());
            
            java.util.List<UserQuizAttempt> solvedAttempts = userQuizAttemptRepository.findByUserId(userId).stream()
                .filter(UserQuizAttempt::isSolved)
                .filter(a -> a.getDateSolved() != null)
                .toList();
            
            java.util.Set<java.time.LocalDate> activeDays = solvedAttempts.stream()
                .map(a -> a.getDateSolved().toLocalDate())
                .collect(java.util.stream.Collectors.toSet());
            
            debug.put("activeDays", activeDays.stream().map(Object::toString).collect(java.util.stream.Collectors.toList()));
            debug.put("solvedAttemptsCount", solvedAttempts.size());
            
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate yesterday = today.minusDays(1);
            debug.put("today", today.toString());
            debug.put("yesterday", yesterday.toString());
            debug.put("solvedToday", activeDays.contains(today));
            
            java.time.LocalDate lastActiveDay = solvedAttempts.stream()
                .map(a -> a.getDateSolved().toLocalDate())
                .filter(d -> d.isBefore(today))
                .max(java.time.LocalDate::compareTo)
                .orElse(null);
            debug.put("lastActiveDay", lastActiveDay != null ? lastActiveDay.toString() : null);
        } else {
            debug.put("error", "User not found");
        }
        
        return debug;
    }

    @GetMapping("/random-unsolved")
    public ResponseEntity<List<QuizResponse>> getRandomUnsolvedQuizzes(
            @RequestParam Long userId,
            @RequestParam(required = false) String topic,
            @RequestParam(defaultValue = "5") int count) {
        
        // Get all quizzes
        List<Quiz> allQuizzes = quizService.getAllQuizEntities();
        
        // Get user's solved quiz IDs
        Set<Long> solvedQuizIds = userQuizAttemptRepository.findByUserId(userId).stream()
            .filter(UserQuizAttempt::isSolved)
            .map(a -> a.getQuiz().getId())
            .collect(java.util.stream.Collectors.toSet());
        
        // Filter unsolved quizzes
        List<Quiz> unsolvedQuizzes = allQuizzes.stream()
            .filter(q -> !solvedQuizIds.contains(q.getId()))
            .collect(java.util.stream.Collectors.toList());
        
        // Filter by topic if specified
        if (topic != null && !topic.isEmpty()) {
            unsolvedQuizzes = unsolvedQuizzes.stream()
                .filter(q -> topic.equalsIgnoreCase(q.getTopic()))
                .collect(java.util.stream.Collectors.toList());
        }
        
        // Shuffle and limit to requested count
        java.util.Collections.shuffle(unsolvedQuizzes);
        List<Quiz> selectedQuizzes = unsolvedQuizzes.stream()
            .limit(count)
            .collect(java.util.stream.Collectors.toList());
        
        // Convert to response DTOs
        List<QuizResponse> responses = selectedQuizzes.stream()
            .map(quiz -> QuizResponse.builder()
                .id(quiz.getId())
                .topic(quiz.getTopic())
                .question(quiz.getQuestion())
                .option1(quiz.getOption1())
                .option2(quiz.getOption2())
                .option3(quiz.getOption3())
                .option4(quiz.getOption4())
                .correctAnswer(quiz.getCorrectAnswer())
                .explanation(quiz.getExplanation())
                .knowledgeLevel(quiz.getKnowledgeLevel() != null ? quiz.getKnowledgeLevel().name() : "EASY")
                .build())
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/solve")
    public Map<String, Object> solveQuiz(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        Long quizId = Long.valueOf(payload.get("quizId").toString());
        String answer = (String) payload.get("answer");
        Quiz quiz = quizService.getAllQuizEntities().stream()
            .filter(q -> q.getId().equals(quizId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Quiz not found"));
        boolean correct = quiz.getCorrectAnswer().equalsIgnoreCase(answer);
        int score = correct ? 1 : 0;
        UserQuizAttempt attempt = userQuizAttemptRepository.findByUserId(userId).stream()
            .filter(a -> a.getQuiz().getId().equals(quizId)).findFirst().orElse(null);
        if (attempt == null) {
            attempt = UserQuizAttempt.builder()
                .user(com.quizapp.model.User.builder().id(userId).build())
                .quiz(quiz)
                .attempted(true)
                .solved(correct)
                .score(score)
                .dateSolved(LocalDateTime.now())
                .build();
        } else {
            attempt.setAttempted(true);
            attempt.setSolved(correct);
            attempt.setScore(score);
            attempt.setDateSolved(LocalDateTime.now());
        }
        userQuizAttemptRepository.save(attempt);

        // Update user's totalQuizzesSolved and streak only if answer is correct
        com.quizapp.model.User user = userRepository.findById(userId).orElse(null);
        if (user != null && correct) {
            // Store the attempt ID to use in lambda
            final Long currentAttemptId = attempt.getId();
            
            // Check if user already solved a quiz today BEFORE this attempt
            java.util.List<UserQuizAttempt> existingSolvedAttempts = userQuizAttemptRepository.findByUserId(userId).stream()
                .filter(UserQuizAttempt::isSolved)
                .filter(a -> a.getDateSolved() != null)
                .filter(a -> !a.getId().equals(currentAttemptId)) // Exclude the current attempt
                .toList();

            java.util.Set<java.time.LocalDate> existingActiveDays = existingSolvedAttempts.stream()
                .map(a -> a.getDateSolved().toLocalDate())
                .collect(java.util.stream.Collectors.toSet());

            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate yesterday = today.minusDays(1);

            // Check if user already solved a quiz today (excluding this attempt)
            boolean alreadySolvedToday = existingActiveDays.contains(today);
            
            long solvedCount = userQuizAttemptRepository.findByUserId(userId).stream()
                .filter(UserQuizAttempt::isSolved)
                .count();
            user.setTotalQuizzesSolved((int) solvedCount);

            // Update days active with the new attempt included
            java.util.Set<java.time.LocalDate> updatedActiveDays = new java.util.HashSet<>(existingActiveDays);
            updatedActiveDays.add(today);
            user.setDaysActive(updatedActiveDays.size());

            if (!alreadySolvedToday) {
                // This is the first solve today, so update streak
                java.time.LocalDate lastActiveDay = existingSolvedAttempts.stream()
                    .map(a -> a.getDateSolved().toLocalDate())
                    .filter(d -> d.isBefore(today))
                    .max(java.time.LocalDate::compareTo)
                    .orElse(null);

                Integer currentStreak = user.getCurrentStreak();
                if (currentStreak == null) {
                    currentStreak = 0;
                }

                if (lastActiveDay != null && lastActiveDay.equals(yesterday)) {
                    // Consecutive day - increment streak
                    user.setCurrentStreak(currentStreak + 1);
                } else if (lastActiveDay == null || lastActiveDay.isBefore(yesterday)) {
                    // Gap in streak - reset to 1
                    user.setCurrentStreak(1);
                }
            }

            userRepository.save(user);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("correct", correct);
        // Only return explanation if answer is correct
        if (correct) {
            result.put("explanation", quiz.getExplanation());
        }
        return result;
    }
} 