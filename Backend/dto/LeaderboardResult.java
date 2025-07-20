package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class LeaderboardResult {
    private List<LeaderboardResponse> top100;
    private Integer userRank;
    private LeaderboardResponse userStats;
} 