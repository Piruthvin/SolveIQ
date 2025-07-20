package com.quizapp.repository;

import com.quizapp.model.ChatbotExplanationCache;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotExplanationCacheRepository extends JpaRepository<ChatbotExplanationCache, Long> {
} 