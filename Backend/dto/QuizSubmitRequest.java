package com.quizapp.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmitRequest {
    private Long userId;
    private Long quizId;
    private Map<Long, String> answers; // questionId -> answer
} 