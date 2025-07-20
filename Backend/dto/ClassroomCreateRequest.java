package com.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ClassroomCreateRequest {
    private String title;
    private String description; // add description field
    private Long teacherId; // optional
    private java.time.LocalDateTime startTime; // optional
    private java.time.LocalDateTime endTime; // optional
    private java.util.List<String> studentEmails; // optional
    private java.lang.String joinLink; // optional
    private java.lang.Boolean isActive; // optional
    private java.time.LocalDateTime createdAt; // optional
} 