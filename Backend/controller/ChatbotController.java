package com.quizapp.controller;

import com.quizapp.dto.ChatbotRequest;
import com.quizapp.dto.ChatbotResponse;
import com.quizapp.dto.ChatbotExplanationResponse;
import com.quizapp.dto.QuizGenerationRequest;
import com.quizapp.dto.QuizGenerationResponse;
import com.quizapp.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {
    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<ChatbotResponse> chat(@RequestBody ChatbotRequest request) {
        return ResponseEntity.ok(chatbotService.processMessage(request));
    }

    @GetMapping("/welcome")
    public ResponseEntity<ChatbotResponse> getWelcomeMessage() {
        return ResponseEntity.ok(chatbotService.getWelcomeMessage());
    }

    @PostMapping("/generate-quiz")
    public ResponseEntity<QuizGenerationResponse> generateQuiz(@RequestBody QuizGenerationRequest request) {
        return ResponseEntity.ok(chatbotService.generateQuiz(request));
    }
} 