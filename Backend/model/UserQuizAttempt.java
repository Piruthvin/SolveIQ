package com.quizapp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    private boolean attempted;
    private boolean solved;
    private java.time.LocalDateTime dateSolved;
    private Integer score;
} 