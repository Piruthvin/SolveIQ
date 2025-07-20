package com.quizapp.dto;

import lombok.Data;

@Data
public class QuizGenerationRequest {
    private String knowledgeLevel;
    private String difficulty;
    private String topic;
    private int numQuestions;
    private Long userId;
} 