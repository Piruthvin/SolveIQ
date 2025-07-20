package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminAnalyticsResponse {
    private Long totalUsers;
    private Long totalQuizzes;
    private Long totalClassrooms;
    private Map<String, Long> usersByRole;
    private List<CollegeStats> collegeStats;
    private List<UserActivity> topActiveUsers;
    private Map<String, Long> quizzesByCategory;
    private Long totalQuizzesSolved;
    private Double averageScore;

    @Data
    @Builder
    public static class CollegeStats {
        private String collegeName;
        private Long studentCount;
        private Long teacherCount;
        private Long totalQuizzesSolved;
        private Double averageScore;
        private Long activeUsers;
    }

    @Data
    @Builder
    public static class UserActivity {
        private Long userId;
        private String userName;
        private String college;
        private Long quizzesSolved;
        private Integer currentStreak;
        private String lastLogin;
    }
} 