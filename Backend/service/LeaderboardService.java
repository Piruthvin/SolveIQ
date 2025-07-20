package com.quizapp.service;

import com.quizapp.dto.LeaderboardResponse;
import com.quizapp.model.Leaderboard;
import com.quizapp.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.Optional;
import com.quizapp.dto.LeaderboardResult;
import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;

    public LeaderboardResult getDailyLeaderboardWithUser(Long userId) {
        LocalDate today = LocalDate.now();
        List<Leaderboard> all = leaderboardRepository.findByDate(today);
        // Map userId to Leaderboard
        java.util.Map<Long, Leaderboard> leaderboardMap = all.stream()
            .collect(Collectors.toMap(l -> l.getUser().getId(), l -> l));
        // Fetch all users
        List<User> allUsers = userRepository.findAll();
        // Build leaderboard responses for all users
        List<LeaderboardResponse> responses = allUsers.stream()
            .map(user -> {
                // Use user's totalQuizzesSolved from users table for score
                int userScore = user.getTotalQuizzesSolved() != null ? user.getTotalQuizzesSolved() : 0;
                return LeaderboardResponse.builder()
                    .id(leaderboardMap.get(user.getId()) != null ? leaderboardMap.get(user.getId()).getId() : null)
                    .date(today)
                    .userId(user.getId())
                    .userName(user.getName())
                    .score(userScore)
                    .college(user.getCollege())
                    .build();
            })
            .sorted(Comparator.comparingInt(LeaderboardResponse::getScore).reversed())
            .limit(100)
            .collect(Collectors.toList());
        // Pad to 100 if needed
        int currentSize = responses.size();
        for (int i = currentSize + 1; i <= 100; i++) {
            responses.add(LeaderboardResponse.builder()
                .id((long) i)
                .userId(null)
                .userName("User " + i)
                .score(0)
                .college("")
                .build());
        }
        // Find user entry and rank
        Integer userRank = null;
        LeaderboardResponse userStats = null;
        for (int i = 0; i < responses.size(); i++) {
            if (responses.get(i).getUserId() != null && responses.get(i).getUserId().equals(userId)) {
                userStats = responses.get(i);
                userRank = i + 1;
                break;
            }
        }
        return new LeaderboardResult(responses, userRank, userStats);
    }

    public LeaderboardResult getCollegeLeaderboardWithUser(String college, Long userId) {
        List<Leaderboard> all = leaderboardRepository.findByCollege(college);
        java.util.Map<Long, Leaderboard> leaderboardMap = all.stream()
            .collect(Collectors.toMap(l -> l.getUser().getId(), l -> l));
        List<User> allUsers = userRepository.findByCollege(college);
        List<LeaderboardResponse> responses = allUsers.stream()
            .map(user -> {
                int userScore = user.getTotalQuizzesSolved() != null ? user.getTotalQuizzesSolved() : 0;
                return LeaderboardResponse.builder()
                    .id(leaderboardMap.get(user.getId()) != null ? leaderboardMap.get(user.getId()).getId() : null)
                    .date(leaderboardMap.get(user.getId()) != null ? leaderboardMap.get(user.getId()).getDate() : null)
                    .userId(user.getId())
                    .userName(user.getName())
                    .score(userScore)
                    .college(user.getCollege())
                    .build();
            })
            .sorted(Comparator.comparingInt(LeaderboardResponse::getScore).reversed())
            .limit(100)
            .collect(Collectors.toList());
        int currentSize = responses.size();
        for (int i = currentSize + 1; i <= 100; i++) {
            responses.add(LeaderboardResponse.builder()
                .id((long) i)
                .userId(null)
                .userName("User " + i)
                .score(0)
                .college("")
                .build());
        }
        // Find user entry and rank
        Integer userRank = null;
        LeaderboardResponse userStats = null;
        for (int i = 0; i < responses.size(); i++) {
            if (responses.get(i).getUserId() != null && responses.get(i).getUserId().equals(userId)) {
                userStats = responses.get(i);
                userRank = i + 1;
                break;
            }
        }
        return new LeaderboardResult(responses, userRank, userStats);
    }

    private LeaderboardResponse toResponse(Leaderboard leaderboard) {
        return LeaderboardResponse.builder()
                .id(leaderboard.getId())
                .date(leaderboard.getDate())
                .userId(leaderboard.getUser().getId())
                .userName(leaderboard.getUser().getName())
                .score(leaderboard.getScore())
                .college(leaderboard.getCollege())
                .build();
    }
} 