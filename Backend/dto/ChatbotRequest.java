package com.quizapp.dto;

import lombok.Data;

@Data
public class ChatbotRequest {
    private String message;
    private Long userId;
} 