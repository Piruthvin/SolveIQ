package com.quizapp.service;

import com.quizapp.dto.ProfileResponse;
import com.quizapp.dto.SearchProfileResponse;
import com.quizapp.dto.ProfileUpdateRequest;
import com.quizapp.model.User;
import com.quizapp.model.UserQuizAttempt;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.UserQuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final UserQuizAttemptRepository userQuizAttemptRepository;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int daysActive = user.getDaysActive() != null ? user.getDaysActive() : 0;

        List<UserQuizAttempt> attempts = userQuizAttemptRepository.findByUserId(userId);
        double averageScore = 0.0;
        int attemptedCount = (int) attempts.stream().filter(UserQuizAttempt::isAttempted).count();
        if (attemptedCount > 0) {
            int totalScore = attempts.stream()
                .filter(UserQuizAttempt::isAttempted)
                .mapToInt(a -> a.getScore() != null ? a.getScore() : 0)
                .sum();
            averageScore = (double)attemptedCount;
        }

        String rank = calculateRank(userId);
        return ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .role(user.getRole().name())
                .daysActive(daysActive)
                .totalQuizzesSolved(user.getTotalQuizzesSolved() != null ? user.getTotalQuizzesSolved() : 0)
                .currentStreak(user.getCurrentStreak() != null ? user.getCurrentStreak() : 0)
                .emailVerified(user.isEmailVerified())
                .profilePicture(user.getProfilePicture())
                .lastLogin(user.getLastLogin() != null ? user.getLastLogin().toString() : "Never")
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                .averageScore(averageScore)
                .totalQuestionsAnswered(attemptedCount)
                .rank(rank)
                .mobileNumber(user.getMobileNumber())
                .links(user.getLinks() != null ? user.getLinks() : java.util.Collections.emptyList())
                .build();
    }

    public ProfileResponse updateProfile(ProfileUpdateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        // Only update mobileNumber if provided and not empty, otherwise retain existing
        if (request.getMobileNumber() != null && !request.getMobileNumber().isEmpty()) {
            user.setMobileNumber(request.getMobileNumber());
        }
        if (request.getLinks() != null) {
            user.setLinks(request.getLinks());
        }
        userRepository.save(user);
        return getProfile(user.getId());
    }
    public ProfileResponse updateProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = "uploads/profile-pics/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = "user_" + userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File dest = new File(dir, fileName);
                file.transferTo(dest);
                String fileUrl = "/uploads/profile-pics/" + fileName;
                user.setProfilePicture(fileUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save profile picture", e);
            }
        }
        userRepository.save(user);
        return getProfile(user.getId());
    }

    public List<SearchProfileResponse> searchStudents(String query) {
        return userRepository.findAll().stream()
                .filter(user ->
                    (user.getName() != null && user.getName().toLowerCase().contains(query.toLowerCase())) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(query.toLowerCase())) ||
                    (user.getCollege() != null && user.getCollege().toLowerCase().contains(query.toLowerCase()))
                )
                .map(this::toSearchProfileResponse)
                .collect(Collectors.toList());
    }

    public SearchProfileResponse getPublicProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("Only student profiles are public");
        }

        return toSearchProfileResponse(user);
    }

    public List<SearchProfileResponse> getAllProfiles() {
        return userRepository.findAll().stream()
                .map(this::toSearchProfileResponse)
                .collect(Collectors.toList());
    }

    public List<SearchProfileResponse> getAllProfiles(String query) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.STUDENT)
                .filter(user -> user.getName().toLowerCase().contains(query.toLowerCase())
                        || user.getEmail().toLowerCase().contains(query.toLowerCase())
                        || user.getCollege().toLowerCase().contains(query.toLowerCase()))
                .map(this::toSearchProfileResponse)
                .collect(Collectors.toList());
    }

    private SearchProfileResponse toSearchProfileResponse(User user) {
        String rank = calculateRank(user.getId());
        // Calculate average score for this user
        List<UserQuizAttempt> attempts = userQuizAttemptRepository.findByUserId(user.getId());
        double averageScore = 0.0;
        int attemptedCount = (int) attempts.stream().filter(UserQuizAttempt::isAttempted).count();
        if (attemptedCount > 0) {
            int totalScore = attempts.stream()
                .filter(UserQuizAttempt::isAttempted)
                .mapToInt(a -> a.getScore() != null ? a.getScore() : 0)
                .sum();
            averageScore = (double) attemptedCount;
        }
        return SearchProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail() != null ? user.getEmail() : "N/A")
                .college(user.getCollege())
                .role(user.getRole() != null ? user.getRole().name() : "STUDENT")
                .totalQuizzesSolved(user.getTotalQuizzesSolved())
                .currentStreak(user.getCurrentStreak())
                .profilePicture(user.getProfilePicture())
                .averageScore(averageScore)
                .rank(rank)
                .isPublic(true)
                .links(user.getLinks() != null ? user.getLinks() : java.util.Collections.emptyList())
                .build();
    }

    private String calculateRank(Long userId) {
        List<User> allUsers = userRepository.findAll();
        List<User> sortedUsers = allUsers.stream()
                .sorted((u1, u2) -> Integer.compare(u2.getTotalQuizzesSolved(), u1.getTotalQuizzesSolved()))
                .collect(Collectors.toList());

        int rank = 1;
        for (User user : sortedUsers) {
            if (user.getId().equals(userId)) {
                break;
            }
            rank++;
        }

        if (rank <= 10) return "Top 10";
        if (rank <= 50) return "Top 50";
        if (rank <=100) return "Top 100";
        return "Rank " + rank;
    }
} 