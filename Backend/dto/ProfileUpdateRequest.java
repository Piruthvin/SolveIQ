package com.quizapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateRequest {
    private Long userId;
    private String name;
    private String mobileNumber;
    private List<String> links;
} 