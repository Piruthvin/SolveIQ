package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class LeaderboardResponse {
    private Long id;
    private LocalDate date;
    private Long userId;
    private String userName;
    private int score;
    private String college;
} 