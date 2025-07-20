package com.quizapp.controller;

import com.quizapp.dto.ProfileResponse;
import com.quizapp.dto.SearchProfileResponse;
import com.quizapp.dto.ProfileUpdateRequest;
import com.quizapp.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@RequestParam Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchProfileResponse>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(profileService.searchStudents(query));
    }

    @GetMapping("/all")
    public ResponseEntity<List<SearchProfileResponse>> getAllProfiles(@RequestParam(value = "query", required = false) String query) {
        if (query != null && !query.isEmpty()) {
            return ResponseEntity.ok(profileService.getAllProfiles(query));
        } else {
            return ResponseEntity.ok(profileService.getAllProfiles());
        }
    }

    @GetMapping("/public/{userId}")
    public ResponseEntity<SearchProfileResponse> getPublicProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getPublicProfile(userId));
    }

    @PatchMapping("/update")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    @PatchMapping("/profile-picture")
    public ResponseEntity<ProfileResponse> updateProfilePicture(
            @RequestParam Long userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(profileService.updateProfilePicture(userId, file));
    }
} 