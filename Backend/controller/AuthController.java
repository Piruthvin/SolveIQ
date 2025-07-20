package com.quizapp.controller;

import com.quizapp.dto.AuthResponse;
import com.quizapp.dto.LoginRequest;
import com.quizapp.dto.RegisterRequest;
import com.quizapp.dto.GoogleSignInRequest;
import com.quizapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.quizapp.model.User;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/google-signin")
    public ResponseEntity<AuthResponse> googleSignIn(@RequestBody GoogleSignInRequest request) {
        return ResponseEntity.ok(userService.googleSignIn(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        userService.changePassword(email, currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/send-verification-email")
    public ResponseEntity<String> sendVerificationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userService.findUserByEmail(email);
        userService.sendVerificationEmail(user);
        return ResponseEntity.ok("Verification email sent");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        AuthResponse response = userService.verifyEmailWithOTP(email, otp);
        return ResponseEntity.ok(response);
    }
} 