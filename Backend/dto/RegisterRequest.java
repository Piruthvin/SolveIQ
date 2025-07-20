package com.quizapp.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String college;
    private String role; // STUDENT, TEACHER, ADMIN
    private String mobileNumber;
} 