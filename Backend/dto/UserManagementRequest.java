package com.quizapp.dto;

import lombok.Data;

@Data
public class UserManagementRequest {
    private String name;
    private String email;
    private String password;
    private String role; // STUDENT, TEACHER, ADMIN
    private String college;
    private String mobileNumber;
}
