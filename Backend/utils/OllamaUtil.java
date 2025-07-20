package com.quizapp.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class OllamaUtil {
    
    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;
    
    @Value("${ollama.model:llama2}")
    private String model;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public String generateResponse(String systemPrompt, String userMessage) {
        try {
            // Prepare the request payload for Ollama
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("prompt", systemPrompt + "\n\nUser: " + userMessage + "\n\nAssistant:");
            requestBody.put("stream", false);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Make the API call to Ollama
            ResponseEntity<String> response = restTemplate.postForEntity(
                ollamaBaseUrl + "/api/generate",
                request,
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String generatedText = jsonResponse.get("response").asText();
                
                // Clean up the response (remove the prompt part if it's included)
                if (generatedText.contains("Assistant:")) {
                    generatedText = generatedText.substring(generatedText.indexOf("Assistant:") + 11).trim();
                }
                
                return generatedText.isEmpty() ? getFallbackResponse(userMessage) : generatedText;
            } else {
                return getFallbackResponse(userMessage);
            }
            
        } catch (Exception e) {
            // Log the error (you can add proper logging here)
            System.err.println("Error calling Ollama API: " + e.getMessage());
            return getFallbackResponse(userMessage);
        }
    }

    public String generateQuizResponse(String systemPrompt, String userMessage) {
        try {
            // Prepare the request payload for Ollama with specific settings for quiz generation
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("prompt", systemPrompt + "\n\nUser: " + userMessage + "\n\nAssistant:");
            requestBody.put("stream", false);
            requestBody.put("temperature", 0.7); // Slightly more creative for quiz generation
            requestBody.put("top_p", 0.9);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Make the API call to Ollama
            ResponseEntity<String> response = restTemplate.postForEntity(
                ollamaBaseUrl + "/api/generate",
                request,
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String generatedText = jsonResponse.get("response").asText();
                
                // Clean up the response (remove the prompt part if it's included)
                if (generatedText.contains("Assistant:")) {
                    generatedText = generatedText.substring(generatedText.indexOf("Assistant:") + 11).trim();
                }
                
                return generatedText.isEmpty() ? getFallbackQuizResponse() : generatedText;
            } else {
                return getFallbackQuizResponse();
            }
            
        } catch (Exception e) {
            // Log the error (you can add proper logging here)
            System.err.println("Error calling Ollama API for quiz generation: " + e.getMessage());
            return getFallbackQuizResponse();
        }
    }
    
    private String getFallbackResponse(String userMessage) {
        // Fallback responses when Ollama is not available
        String message = userMessage.toLowerCase();
        
        if (message.contains("algorithm") || message.contains("algorithms")) {
            return "Algorithms are step-by-step procedures used for calculations, data processing, and automated reasoning. " +
                   "Common algorithm categories include:\n\n" +
                   "• **Sorting Algorithms**: Bubble sort, Quick sort, Merge sort\n" +
                   "• **Search Algorithms**: Linear search, Binary search\n" +
                   "• **Graph Algorithms**: BFS, DFS, Dijkstra's\n" +
                   "• **Dynamic Programming**: Memoization, Tabulation\n\n" +
                   "Would you like me to explain any specific algorithm in detail?";
        } else if (message.contains("data structure") || message.contains("data structures")) {
            return "Data structures are ways of organizing and storing data for efficient access and modification. " +
                   "Key data structures include:\n\n" +
                   "• **Arrays**: Fixed-size collections\n" +
                   "• **Linked Lists**: Dynamic collections with pointers\n" +
                   "• **Stacks**: LIFO (Last In, First Out)\n" +
                   "• **Queues**: FIFO (First In, First Out)\n" +
                   "• **Trees**: Hierarchical structures\n" +
                   "• **Graphs**: Network structures\n" +
                   "• **Hash Tables**: Key-value storage\n\n" +
                   "Which data structure would you like to learn more about?";
        } else if (message.contains("database") || message.contains("sql")) {
            return "Databases are organized collections of data. Key concepts include:\n\n" +
                   "• **SQL**: Structured Query Language for relational databases\n" +
                   "• **ACID Properties**: Atomicity, Consistency, Isolation, Durability\n" +
                   "• **Normalization**: Reducing data redundancy\n" +
                   "• **Indexing**: Improving query performance\n" +
                   "• **Transactions**: Ensuring data integrity\n\n" +
                   "What specific database topic interests you?";
        } else if (message.contains("study") || message.contains("preparation") || message.contains("tips")) {
            return "Here are some effective study strategies for technical quizzes:\n\n" +
                   "🎯 **Practice Regularly**: Solve problems daily\n" +
                   "📚 **Understand Concepts**: Don't just memorize\n" +
                   "⏰ **Time Management**: Practice with time limits\n" +
                   "🔄 **Review Mistakes**: Learn from errors\n" +
                   "📝 **Take Notes**: Document key concepts\n" +
                   "👥 **Study Groups**: Collaborate with others\n" +
                   "🧠 **Active Learning**: Explain concepts to others\n\n" +
                   "What specific area would you like to focus on?";
        } else if (message.contains("hello") || message.contains("hi") || message.contains("hey")) {
            return "Hello! I'm your AI quiz assistant. I can help you with:\n\n" +
                   "📚 Quiz topics and explanations\n" +
                   "🎯 Study strategies and tips\n" +
                   "❓ Concept clarifications\n" +
                   "💡 Problem-solving guidance\n\n" +
                   "What would you like to learn about today?";
        } else {
            return "I'm here to help you with your quiz preparation! You can ask me about:\n\n" +
                   "• **Algorithms and Data Structures**\n" +
                   "• **Database concepts and SQL**\n" +
                   "• **System Design principles**\n" +
                   "• **Frontend and Backend development**\n" +
                   "• **Study strategies and tips**\n" +
                   "• **Technical interview preparation**\n\n" +
                   "What specific topic would you like to explore?";
        }
    }
    
    private String getFallbackQuizResponse() {
        return """
        {
            "title": "Technical Quiz",
            "questions": [
                {
                    "questionText": "What is the time complexity of binary search?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                    "correctAnswer": "O(log n)",
                    "explanation": "Binary search divides the search space in half with each iteration, resulting in logarithmic time complexity."
                },
                {
                    "questionText": "Which data structure uses LIFO (Last In, First Out)?",
                    "options": ["Queue", "Stack", "Tree", "Graph"],
                    "correctAnswer": "Stack",
                    "explanation": "A stack follows the LIFO principle where the last element added is the first one to be removed."
                },
                {
                    "questionText": "What is the primary purpose of a hash table?",
                    "options": ["Sorting", "Searching", "Fast lookup", "Memory management"],
                    "correctAnswer": "Fast lookup",
                    "explanation": "Hash tables provide average O(1) time complexity for insertions and lookups, making them ideal for fast data retrieval."
                }
            ]
        }
        """;
    }
} 