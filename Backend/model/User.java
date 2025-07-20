package com.quizapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String college;

    @Column(nullable = false)
    private String mobileNumber;

    private boolean emailVerified = false;

    private String googleId;

    private String profilePicture;
    @ElementCollection
    private List<String> links = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Column(name = "total_quizzes_solved")
    private Integer totalQuizzesSolved = 0;

    @Column(name = "days_active")
    private Integer daysActive = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastLogin = LocalDateTime.now();
    }

    public enum Role {
        STUDENT, TEACHER, ADMIN
    }
} 