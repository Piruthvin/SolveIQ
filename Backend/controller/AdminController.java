package com.quizapp.controller;

import com.quizapp.dto.AdminAnalyticsResponse;
import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private AdminService adminService;

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        List<User> users = userRepository.findAll();
        
        // Calculate daily active users (users who logged in today)
        long dailyActive = users.stream()
                .filter(user -> user.getLastLogin() != null && 
                        user.getLastLogin().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .count();
        
        analytics.put("totalUsers", users.size());
        analytics.put("totalQuizzes", quizRepository.count());
        analytics.put("totalColleges", users.stream()
                .map(User::getCollege)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()).size());
        analytics.put("dailyActive", dailyActive);
        return analytics;
    }

    @GetMapping("/analytics/detailed")
    public AdminAnalyticsResponse getDetailedAnalytics() {
        return adminService.getAnalytics();
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers() {
        List<Map<String, Object>> result = userRepository.findAll().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getName());
            map.put("email", user.getEmail());
            map.put("role", user.getRole().name());
            map.put("college", user.getCollege());
            return map;
        }).collect(Collectors.toList());
        return result;
    }

    @PostMapping("/users")
    public Map<String, Object> addUser(@RequestBody Map<String, Object> payload) {
        User user = new User();
        user.setName((String) payload.get("name"));
        user.setEmail((String) payload.get("email"));
        user.setPassword((String) payload.get("password"));
        user.setRole(User.Role.valueOf(((String) payload.get("role")).toUpperCase()));
        user.setCollege((String) payload.get("college"));
        user = userRepository.save(user);
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole().name());
        map.put("college", user.getCollege());
        return map;
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
} 