package com.quizapp.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class QuizGenerationResponse {
    private Long quizId;
    private String title;
    private String category;
    private String difficulty;
    private String knowledgeLevel;
} 