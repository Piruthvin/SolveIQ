package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProfileResponse {
    private Long userId;
    private String name;
    private String email;
    private String college;
    private String role;
    private Integer daysActive;
    private Integer totalQuizzesSolved;
    private Integer currentStreak;
    private boolean emailVerified;
    private String profilePicture;
    private String lastLogin;
    private String createdAt;
    private Double averageScore;
    private Integer totalQuestionsAnswered;
    private String rank;
    private String mobileNumber;
    private List<String> links;
} 