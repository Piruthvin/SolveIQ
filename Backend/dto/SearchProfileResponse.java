package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SearchProfileResponse {
    private Long userId;
    private String name;
    private String college;
    private Integer totalQuizzesSolved;
    private Integer currentStreak;
    private String profilePicture;
    private Double averageScore;
    private String rank;
    private boolean isPublic;
    private String email;
    private String role;
    private List<String> links;
} 