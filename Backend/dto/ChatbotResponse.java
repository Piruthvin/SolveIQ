package com.quizapp.dto;

import lombok.Data;

@Data
public class ChatbotResponse {
    private String response;
    private String timestamp;
    
    public ChatbotResponse(String response) {
        this.response = response;
        this.timestamp = java.time.LocalDateTime.now().toString();
    }
} 