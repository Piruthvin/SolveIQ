package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ClassroomResponse {
    private Long id;
    private String title;
    private String teacherName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String joinLink;
    private boolean isActive;
    private int studentCount;
    private List<ClassroomStudentResponse> students;
} 