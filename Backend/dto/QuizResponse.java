package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizResponse {
    private Long id;
    private String topic;
    private String question;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String correctAnswer;
    private String explanation;
    private String knowledgeLevel;
} 