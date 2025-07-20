package com.quizapp.service;

import com.quizapp.dto.AdminAnalyticsResponse;
import com.quizapp.dto.UserManagementRequest;
import com.quizapp.dto.CollegeManagementRequest;
import com.quizapp.model.User;
import com.quizapp.model.UserQuizAttempt;
import com.quizapp.model.Classroom;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.UserQuizAttemptRepository;
import com.quizapp.repository.ClassroomRepository;
import com.quizapp.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final UserQuizAttemptRepository userQuizAttemptRepository;
    private final ClassroomRepository classroomRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAnalyticsResponse getAnalytics() {
        long totalUsers = userRepository.count();
        long totalQuizzes = quizRepository.count();
        long totalClassrooms = classroomRepository.count();
        long totalQuizzesSolved = userQuizAttemptRepository.count();

        // Users by role
        Map<String, Long> usersByRole = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(user -> user.getRole().name(), Collectors.counting()));

        // College stats
        List<AdminAnalyticsResponse.CollegeStats> collegeStats = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(User::getCollege))
                .entrySet().stream()
                .map(entry -> {
                    String college = entry.getKey();
                    List<User> users = entry.getValue();
                    long studentCount = users.stream().filter(u -> u.getRole() == User.Role.STUDENT).count();
                    long teacherCount = users.stream().filter(u -> u.getRole() == User.Role.TEACHER).count();
                    long activeUsers = users.stream().filter(u -> u.getLastLogin() != null && 
                            u.getLastLogin().isAfter(LocalDateTime.now().minusDays(7))).count();
                    
                    return AdminAnalyticsResponse.CollegeStats.builder()
                            .collegeName(college)
                            .studentCount(studentCount)
                            .teacherCount(teacherCount)
                            .activeUsers(activeUsers)
                            .totalQuizzesSolved(0L) // TODO: Calculate from attempts
                            .averageScore(0.0) // TODO: Calculate from attempts
                            .build();
                })
                .collect(Collectors.toList());

        // Top active users
        List<AdminAnalyticsResponse.UserActivity> topActiveUsers = userRepository.findAll().stream()
                .sorted((u1, u2) -> Integer.compare(u2.getTotalQuizzesSolved(), u1.getTotalQuizzesSolved()))
                .limit(10)
                .map(user -> AdminAnalyticsResponse.UserActivity.builder()
                        .userId(user.getId())
                        .userName(user.getName())
                        .college(user.getCollege())
                        .quizzesSolved((long) user.getTotalQuizzesSolved())
                        .currentStreak(user.getCurrentStreak())
                        .lastLogin(user.getLastLogin() != null ? user.getLastLogin().toString() : "Never")
                        .build())
                .collect(Collectors.toList());

        // Quizzes by category
        Map<String, Long> quizzesByCategory = quizRepository.findAll().stream()
                .collect(Collectors.groupingBy(quiz -> quiz.getTopic(), Collectors.counting()));

        // Average score
        double averageScore = 0.0; // No score field in UserQuizAttempt

        return AdminAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalQuizzes(totalQuizzes)
                .totalClassrooms(totalClassrooms)
                .usersByRole(usersByRole)
                .collegeStats(collegeStats)
                .topActiveUsers(topActiveUsers)
                .quizzesByCategory(quizzesByCategory)
                .totalQuizzesSolved(totalQuizzesSolved)
                .averageScore(averageScore)
                .build();
    }

    public User addUser(UserManagementRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                .college(request.getCollege())
                .mobileNumber(request.getMobileNumber())
                .emailVerified(true)
                .build();

        return userRepository.save(user);
    }

    public User updateUser(Long userId, UserManagementRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        user.setCollege(request.getCollege());
        user.setMobileNumber(request.getMobileNumber());

        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByCollege(String college) {
        return userRepository.findAll().stream()
                .filter(user -> user.getCollege().equals(college))
                .collect(Collectors.toList());
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().name().equals(role.toUpperCase()))
                .collect(Collectors.toList());
    }
} 