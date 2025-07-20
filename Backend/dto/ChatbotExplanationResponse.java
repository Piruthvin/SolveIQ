package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatbotExplanationResponse {
    private String explanation;
} 