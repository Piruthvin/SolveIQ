package com.quizapp.service;

import com.quizapp.dto.ChatbotRequest;
import com.quizapp.dto.ChatbotResponse;
import com.quizapp.dto.ChatbotExplanationResponse;
import com.quizapp.dto.QuizGenerationRequest;
import com.quizapp.dto.QuizGenerationResponse;
import com.quizapp.model.ChatbotExplanationCache;
import com.quizapp.repository.ChatbotExplanationCacheRepository;
import com.quizapp.utils.OllamaUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotService {
    private final OllamaUtil ollamaUtil;
    private final ChatbotExplanationCacheRepository cacheRepository;

    public ChatbotResponse processMessage(ChatbotRequest request) {
        String userMessage = request.getMessage();
        Long userId = request.getUserId();

        // Create a context-aware prompt for quiz-related questions
        String systemPrompt = """
            You are an AI assistant for a quiz application. You help users with:
            1. Quiz-related questions and explanations
            2. Study tips and strategies
            3. General knowledge questions
            4. Learning guidance
            
            Be helpful, friendly, and educational. Keep responses concise but informative.
            If the user asks about specific quiz topics, provide relevant information.
            """;

        try {
            String response = ollamaUtil.generateResponse(systemPrompt, userMessage);
            return new ChatbotResponse(response);
        } catch (Exception e) {
            // Fallback response if AI service is unavailable
            return new ChatbotResponse(
                "I'm here to help you with your quiz preparation! You can ask me about:\n" +
                "• Quiz topics and explanations\n" +
                "• Study strategies\n" +
                "• General knowledge questions\n" +
                "• Learning tips\n\n" +
                "What would you like to know?"
            );
        }
    }

    public ChatbotResponse getWelcomeMessage() {
        return new ChatbotResponse(
            "Hello! I'm your AI quiz assistant. I can help you with:\n\n" +
            "📚 **Quiz Topics**: Ask about algorithms, data structures, databases, system design, frontend, backend, DevOps, mobile development, and more!\n\n" +
            "🎯 **Study Tips**: Get advice on how to prepare for technical interviews and quizzes\n\n" +
            "❓ **Explanations**: Ask for detailed explanations of concepts you're learning\n\n" +
            "💡 **Practice Questions**: Get help with solving problems\n\n" +
            "What would you like to explore today?"
        );
    }

    public QuizGenerationResponse generateQuiz(QuizGenerationRequest request) {
        String systemPrompt = """
            You are an expert quiz generator for technical topics. Create a quiz with the following specifications:
            
            Topic: %s
            Difficulty: %s
            Knowledge Level: %s
            Number of Questions: %d
            
            Generate questions that are:
            1. Relevant to the topic
            2. Appropriate for the specified difficulty level
            3. Suitable for the knowledge level
            4. Multiple choice with 4 options (A, B, C, D)
            5. Clear and well-written
            6. Include explanations for correct answers
            
            Format your response as a JSON object with the following structure:
            {
                "title": "Quiz Title",
                "questions": [
                    {
                        "questionText": "Question text here?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": "Option A",
                        "explanation": "Explanation of why this is correct"
                    }
                ]
            }
            
            Make sure the JSON is valid and properly formatted.
            """.formatted(request.getTopic(), request.getDifficulty(), request.getKnowledgeLevel(), request.getNumQuestions());

        try {
            String response = ollamaUtil.generateQuizResponse(systemPrompt, "Generate a quiz based on the specifications above.");
            // Parse the JSON response from Ollama
            // For now, just return a quiz with metadata only (no questions)
            return QuizGenerationResponse.builder()
                .quizId(System.currentTimeMillis())
                .title(request.getTopic() + " Quiz - " + request.getDifficulty())
                .category(request.getTopic())
                .difficulty(request.getDifficulty())
                .knowledgeLevel(request.getKnowledgeLevel())
                .build();
        } catch (Exception e) {
            // Return a fallback quiz if Ollama fails
            return QuizGenerationResponse.builder()
                .quizId(System.currentTimeMillis())
                .title(request.getTopic() + " Quiz - " + request.getDifficulty())
                .category(request.getTopic())
                .difficulty(request.getDifficulty())
                .knowledgeLevel(request.getKnowledgeLevel())
                .build();
        }
    }
} 