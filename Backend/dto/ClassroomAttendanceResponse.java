package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ClassroomAttendanceResponse {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDateTime joinedAt;
    private LocalDateTime submittedAt;
    private Integer score;
    private String status;
} 