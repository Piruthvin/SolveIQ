package com.quizapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.NOT_ATTENDED;

    public enum Status {
        ATTENDED, FAILED, NOT_ATTENDED
    }
} 