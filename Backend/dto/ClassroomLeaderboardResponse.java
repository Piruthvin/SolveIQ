package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClassroomLeaderboardResponse {
    private String name;
    private int score;
} 