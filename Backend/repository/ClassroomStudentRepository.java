package com.quizapp.repository;

import com.quizapp.model.ClassroomStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassroomStudentRepository extends JpaRepository<ClassroomStudent, Long> {
    List<ClassroomStudent> findByClassroomId(Long classroomId);
    List<ClassroomStudent> findByStudentId(Long studentId);
    Optional<ClassroomStudent> findByClassroomIdAndStudentId(Long classroomId, Long studentId);
    List<ClassroomStudent> findByClassroomIdAndStatus(Long classroomId, ClassroomStudent.Status status);
} 