package com.quizapp.repository;

import com.quizapp.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByTeacherId(Long teacherId);
    Optional<Classroom> findByJoinLink(String joinLink);
    List<Classroom> findByIsActiveTrue();
} 