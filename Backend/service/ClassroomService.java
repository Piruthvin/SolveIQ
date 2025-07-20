package com.quizapp.service;

import com.quizapp.dto.ClassroomCreateRequest;
import com.quizapp.dto.ClassroomResponse;
import com.quizapp.dto.ClassroomAttendanceResponse;
import com.quizapp.dto.ClassroomLeaderboardResponse;
import com.quizapp.dto.ClassroomStudentResponse;
import com.quizapp.model.Classroom;
import com.quizapp.model.ClassroomStudent;
import com.quizapp.model.User;
import com.quizapp.repository.ClassroomRepository;
import com.quizapp.repository.ClassroomStudentRepository;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {
    private final ClassroomRepository classroomRepository;
    private final ClassroomStudentRepository classroomStudentRepository;
    private final UserRepository userRepository;

    /**
     * Creates a classroom and assigns students by email (if provided).
     */
    public ClassroomResponse createClassroom(ClassroomCreateRequest request, User teacher) {
        String joinLink = request.getJoinLink() != null && !request.getJoinLink().isEmpty()
            ? request.getJoinLink()
            : UUID.randomUUID().toString().replace("-", ""); // cleaner UUID

        // Set start/end time if not provided
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startTime = request.getStartTime() != null ? request.getStartTime() : now;
        java.time.LocalDateTime endTime = request.getEndTime() != null ? request.getEndTime() : now.plusHours(1);
        boolean isActive = request.getIsActive() != null ? request.getIsActive() : true;
        java.time.LocalDateTime createdAt = request.getCreatedAt() != null ? request.getCreatedAt() : now;

        Classroom classroom = Classroom.builder()
                .title(request.getTitle())
                .teacher(teacher)
                .startTime(startTime)
                .endTime(endTime)
                .joinLink(joinLink)
                .isActive(isActive)
                .createdAt(createdAt)
                .build();

        classroom = classroomRepository.save(classroom); // assign once

        // Add students to classroom
        final Classroom finalClassroom = classroom; // ensure it's effectively final
        if (request.getStudentEmails() != null) {
            for (String email : request.getStudentEmails()) {
                userRepository.findByEmail(email).ifPresent(student -> {
                    ClassroomStudent classroomStudent = ClassroomStudent.builder()
                            .classroom(finalClassroom)
                            .student(student)
                            .status(ClassroomStudent.Status.NOT_ATTENDED)
                            .build();
                    classroomStudentRepository.save(classroomStudent);
                });
            }
        }

        return toResponse(classroom);
    }

    /**
     * Allows a student to join a classroom via join link.
     */
    public ClassroomResponse joinClassroom(String joinLink, Long studentId) {
        Classroom classroom = classroomRepository.findByJoinLink(joinLink)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with join link: " + joinLink));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        ClassroomStudent existing = classroomStudentRepository
                .findByClassroomIdAndStudentId(classroom.getId(), studentId)
                .orElse(null);

        if (existing == null) {
            existing = ClassroomStudent.builder()
                    .classroom(classroom)
                    .student(student)
                    .joinedAt(LocalDateTime.now())
                    .status(ClassroomStudent.Status.ATTENDED)
                    .build();
        } else {
            existing.setJoinedAt(LocalDateTime.now());
            existing.setStatus(ClassroomStudent.Status.ATTENDED);
        }

        classroomStudentRepository.save(existing);
        return toResponse(classroom);
    }

    /**
     * Marks a quiz as submitted with score for a student in a classroom.
     */
    public void submitClassroomQuiz(Long classroomId, Long studentId, Integer score) {
        ClassroomStudent classroomStudent = classroomStudentRepository
                .findByClassroomIdAndStudentId(classroomId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not in classroom"));

        classroomStudent.setSubmittedAt(LocalDateTime.now());
        classroomStudent.setScore(score);
        classroomStudent.setStatus(ClassroomStudent.Status.ATTENDED);
        classroomStudentRepository.save(classroomStudent);
    }

    /**
     * Marks a student as failed (e.g. left full screen).
     */
    public void markAsFailed(Long classroomId, Long studentId) {
        ClassroomStudent classroomStudent = classroomStudentRepository
                .findByClassroomIdAndStudentId(classroomId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not in classroom"));

        classroomStudent.setStatus(ClassroomStudent.Status.FAILED);
        classroomStudentRepository.save(classroomStudent);
    }

    /**
     * Returns attendance list of a classroom.
     */
    public List<ClassroomAttendanceResponse> getClassroomAttendance(Long classroomId) {
        List<ClassroomStudent> students = classroomStudentRepository.findByClassroomId(classroomId);
        return students.stream()
                .map(this::toAttendanceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns leaderboard for a classroom.
     */
    public List<ClassroomLeaderboardResponse> getClassroomLeaderboard(Long classroomId) {
        List<ClassroomStudent> students = classroomStudentRepository.findByClassroomId(classroomId);
        return students.stream()
                .map(cs -> new ClassroomLeaderboardResponse(
                        cs.getStudent().getName(),
                        cs.getScore() != null ? cs.getScore() : 0
                ))
                .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))
                .collect(Collectors.toList());
    }

    /**
     * Returns classrooms created by a teacher.
     */
    public List<ClassroomResponse> getTeacherClassrooms(Long teacherId) {
        return classroomRepository.findByTeacherId(teacherId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns classrooms joined by a student.
     */
    public List<ClassroomResponse> getStudentClassrooms(Long studentId) {
        List<ClassroomStudent> classroomStudents = classroomStudentRepository.findByStudentId(studentId);
        return classroomStudents.stream()
                .map(cs -> toResponse(cs.getClassroom()))
                .collect(Collectors.toList());
    }

    /**
     * Returns a single classroom by ID with authorization check.
     */
    public ClassroomResponse getClassroomById(Long classroomId, User user) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        // Check if user is the teacher or a student in this classroom
        boolean isTeacher = classroom.getTeacher().getId().equals(user.getId());
        boolean isStudent = classroomStudentRepository.findByClassroomIdAndStudentId(classroomId, user.getId()).isPresent();

        if (!isTeacher && !isStudent) {
            throw new RuntimeException("Access denied: User is not authorized to view this classroom");
        }

        // Get students for this classroom
        List<ClassroomStudent> students = classroomStudentRepository.findByClassroomId(classroomId);
        
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .title(classroom.getTitle())
                .teacherName(classroom.getTeacher().getName())
                .startTime(classroom.getStartTime())
                .endTime(classroom.getEndTime())
                .joinLink(classroom.getJoinLink())
                .isActive(classroom.isActive())
                .studentCount(students.size())
                .students(students.stream()
                        .map(cs -> ClassroomStudentResponse.builder()
                                .id(cs.getStudent().getId())
                                .name(cs.getStudent().getName())
                                .email(cs.getStudent().getEmail())
                                .joinedAt(cs.getJoinedAt())
                                .score(cs.getScore())
                                .status(cs.getStatus().name())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Helper to map Classroom to ClassroomResponse DTO.
     */
    private ClassroomResponse toResponse(Classroom classroom) {
        int studentCount = classroomStudentRepository.findByClassroomId(classroom.getId()).size();
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .title(classroom.getTitle())
                .teacherName(classroom.getTeacher().getName())
                .startTime(classroom.getStartTime())
                .endTime(classroom.getEndTime())
                .joinLink(classroom.getJoinLink())
                .isActive(classroom.isActive())
                .studentCount(studentCount)
                .students(null) // Don't include students in list responses for performance
                .build();
    }

    /**
     * Helper to map ClassroomStudent to ClassroomAttendanceResponse DTO.
     */
    private ClassroomAttendanceResponse toAttendanceResponse(ClassroomStudent classroomStudent) {
        return ClassroomAttendanceResponse.builder()
                .studentId(classroomStudent.getStudent().getId())
                .studentName(classroomStudent.getStudent().getName())
                .studentEmail(classroomStudent.getStudent().getEmail())
                .joinedAt(classroomStudent.getJoinedAt())
                .submittedAt(classroomStudent.getSubmittedAt())
                .score(classroomStudent.getScore())
                .status(classroomStudent.getStatus().name())
                .build();
    }

    /**
     * Adds students to a classroom by email.
     */
    public void addStudentsToClassroom(Long classroomId, List<String> emails, User teacher) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        // Check if user is the teacher of this classroom
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Access denied: Only the teacher can add students to this classroom");
        }

        for (String email : emails) {
            userRepository.findByEmail(email).ifPresent(student -> {
                // Check if student is already in the classroom
                Optional<ClassroomStudent> existing = classroomStudentRepository
                        .findByClassroomIdAndStudentId(classroomId, student.getId());
                
                if (existing.isEmpty()) {
                    ClassroomStudent classroomStudent = ClassroomStudent.builder()
                            .classroom(classroom)
                            .student(student)
                            .status(ClassroomStudent.Status.NOT_ATTENDED)
                            .build();
                    classroomStudentRepository.save(classroomStudent);
                }
            });
        }
    }

    /**
     * Generates a quiz for a classroom.
     */
    public void generateQuizForClassroom(Long classroomId, String title, Integer questionCount, String difficulty, User teacher) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        // Check if user is the teacher of this classroom
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Access denied: Only the teacher can generate quizzes for this classroom");
        }

        // TODO: Implement quiz generation logic
        // For now, just log the request
        System.out.println("Generating quiz for classroom " + classroomId + ": " + title + " (" + questionCount + " questions, " + difficulty + ")");
    }

    /**
     * Removes a student from a classroom.
     */
    public void removeStudentFromClassroom(Long classroomId, Long studentId, User teacher) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        // Check if user is the teacher of this classroom
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Access denied: Only the teacher can remove students from this classroom");
        }

        ClassroomStudent classroomStudent = classroomStudentRepository
                .findByClassroomIdAndStudentId(classroomId, studentId)
                .orElseThrow(() -> new RuntimeException("Student not found in classroom"));

        classroomStudentRepository.delete(classroomStudent);
    }
} 