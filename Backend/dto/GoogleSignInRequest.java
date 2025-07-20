package com.quizapp.dto;

import lombok.Data;

@Data
public class GoogleSignInRequest {
    private String idToken;
    private String name;
    private String email;
    private String college;
    private String mobileNumber;
    private String role; // STUDENT, TEACHER
} 