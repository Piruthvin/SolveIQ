package com.quizapp.service;

import com.quizapp.dto.AuthResponse;
import com.quizapp.dto.LoginRequest;
import com.quizapp.dto.RegisterRequest;
import com.quizapp.dto.GoogleSignInRequest;
import com.quizapp.dto.ProfileResponse;
import com.quizapp.exception.EmailAlreadyExistsException;
import com.quizapp.model.User;
import com.quizapp.model.EmailVerificationToken;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.EmailVerificationTokenRepository;
import com.quizapp.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                .college(request.getCollege())
                .mobileNumber(request.getMobileNumber())
                .emailVerified(false)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        ProfileResponse profile = ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
        return new AuthResponse(token, profile);
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Update lastLogin
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        ProfileResponse profile = ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
        return new AuthResponse(token, profile);
    }

    public AuthResponse googleSignIn(GoogleSignInRequest request) {
        // TODO: Verify idToken with Google API
        // For now, assume idToken is valid and email is verified
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password("") // No password for Google users
                    .role(User.Role.valueOf(request.getRole().toUpperCase()))
                    .college(request.getCollege())
                    .mobileNumber(request.getMobileNumber())
                    .emailVerified(true)
                    .googleId(request.getIdToken()) // Store idToken or Google userId
                    .build();
            userRepository.save(user);
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        ProfileResponse profile = ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
        return new AuthResponse(token, profile);
    }

    public void sendVerificationEmail(User user) {
        // Generate a 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(10)) // OTP expires in 10 minutes
                .build();
        tokenRepository.save(verificationToken);
        
        // Send OTP via email
        emailService.sendOTPEmail(user.getEmail(), otp);
    }

    public AuthResponse verifyEmailWithOTP(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        EmailVerificationToken verificationToken = tokenRepository.findByToken(otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        
        if (!verificationToken.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Invalid OTP for this user");
        }
        
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
        
        // Generate new token and return updated user data
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        ProfileResponse profile = ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
        return new AuthResponse(token, profile);
    }

    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
        return true;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}