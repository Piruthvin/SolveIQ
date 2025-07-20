package com.quizapp.controller;

import com.quizapp.dto.ClassroomCreateRequest;
import com.quizapp.dto.ClassroomResponse;
import com.quizapp.dto.ClassroomAttendanceResponse;
import com.quizapp.dto.ClassroomLeaderboardResponse;
import com.quizapp.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.security.Principal;
import java.util.Map;

import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;

@RestController
@RequestMapping("/api/classroom")
@RequiredArgsConstructor
public class ClassroomController {
    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<ClassroomResponse> createClassroom(@RequestBody ClassroomCreateRequest request, Principal principal) {
        String email = principal.getName();
        User teacher = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Teacher not found: " + email));
        return ResponseEntity.ok(classroomService.createClassroom(request, teacher));
    }

    @PostMapping("/join")
    public ResponseEntity<ClassroomResponse> joinClassroom(@RequestParam String joinLink, @RequestParam Long studentId) {
        return ResponseEntity.ok(classroomService.joinClassroom(joinLink, studentId));
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitClassroomQuiz(@RequestParam Long classroomId, @RequestParam Long studentId, @RequestParam Integer score) {
        classroomService.submitClassroomQuiz(classroomId, studentId, score);
        return ResponseEntity.ok("Quiz submitted successfully");
    }

    @PostMapping("/mark-failed")
    public ResponseEntity<String> markAsFailed(@RequestParam Long classroomId, @RequestParam Long studentId) {
        classroomService.markAsFailed(classroomId, studentId);
        return ResponseEntity.ok("Student marked as failed");
    }

    @GetMapping("/attendance/{classroomId}")
    public ResponseEntity<List<ClassroomAttendanceResponse>> getClassroomAttendance(@PathVariable Long classroomId) {
        return ResponseEntity.ok(classroomService.getClassroomAttendance(classroomId));
    }

    @GetMapping("/leaderboard/{classroomId}")
    public ResponseEntity<List<ClassroomLeaderboardResponse>> getClassroomLeaderboard(@PathVariable Long classroomId) {
        return ResponseEntity.ok(classroomService.getClassroomLeaderboard(classroomId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassroomResponse>> getTeacherClassrooms(@PathVariable Long teacherId) {
        return ResponseEntity.ok(classroomService.getTeacherClassrooms(teacherId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ClassroomResponse>> getStudentClassrooms(@PathVariable Long studentId) {
        return ResponseEntity.ok(classroomService.getStudentClassrooms(studentId));
    }

    @GetMapping("/{classroomId}")
    public ResponseEntity<ClassroomResponse> getClassroomById(@PathVariable Long classroomId, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        return ResponseEntity.ok(classroomService.getClassroomById(classroomId, user));
    }

    @PostMapping("/{classroomId}/add-students")
    public ResponseEntity<String> addStudentsToClassroom(@PathVariable Long classroomId, @RequestBody Map<String, List<String>> request, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        List<String> emails = request.get("emails");
        classroomService.addStudentsToClassroom(classroomId, emails, user);
        return ResponseEntity.ok("Students added successfully");
    }

    @PostMapping("/{classroomId}/generate-quiz")
    public ResponseEntity<String> generateQuizForClassroom(@PathVariable Long classroomId, @RequestBody Map<String, Object> request, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        String title = (String) request.get("title");
        Integer questionCount = (Integer) request.get("questionCount");
        String difficulty = (String) request.get("difficulty");
        classroomService.generateQuizForClassroom(classroomId, title, questionCount, difficulty, user);
        return ResponseEntity.ok("Quiz generated successfully");
    }

    @DeleteMapping("/{classroomId}/students/{studentId}")
    public ResponseEntity<String> removeStudentFromClassroom(@PathVariable Long classroomId, @PathVariable Long studentId, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        classroomService.removeStudentFromClassroom(classroomId, studentId, user);
        return ResponseEntity.ok("Student removed successfully");
    }
} 