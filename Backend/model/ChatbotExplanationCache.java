package com.quizapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chatbot_explanation_cache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotExplanationCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String explanation;
} 