package com.quizapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic;
    private String question;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String correctAnswer;
    private String explanation;

    public enum KnowledgeLevel {
        EASY, MEDIUM, HARD
    }

    @Enumerated(EnumType.STRING)
    private KnowledgeLevel knowledgeLevel;
} 