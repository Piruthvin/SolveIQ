package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private int attempts;
    private float avgScore;
} 