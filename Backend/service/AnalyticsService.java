package com.quizapp.service;

import com.quizapp.dto.AnalyticsResponse;
import com.quizapp.model.Analytics;
import com.quizapp.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final AnalyticsRepository analyticsRepository;

    public List<AnalyticsResponse> getAllAnalytics() {
        return analyticsRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AnalyticsResponse getAnalyticsForQuiz(Long quizId) {
        Analytics analytics = analyticsRepository.findByQuizId(quizId)
                .orElseThrow(() -> new RuntimeException("Analytics not found for quiz"));
        return toResponse(analytics);
    }

    private AnalyticsResponse toResponse(Analytics analytics) {
        return AnalyticsResponse.builder()
                .id(analytics.getId())
                .quizId(analytics.getQuiz().getId())
                // .quizTitle(analytics.getQuiz().getTitle()) // Remove or replace with topic if needed
                .attempts(analytics.getAttempts())
                .avgScore(analytics.getAvgScore())
                .build();
    }
} 