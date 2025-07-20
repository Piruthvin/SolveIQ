package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ClassroomStudentResponse {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime joinedAt;
    private Integer score;
    private String status;
} 