package com.LearnifyMajor.server.Repository;

import com.LearnifyMajor.server.Entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizEntityRepository extends JpaRepository<QuizEntity, Long> {
}