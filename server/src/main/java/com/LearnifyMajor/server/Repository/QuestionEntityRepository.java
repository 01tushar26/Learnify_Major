package com.LearnifyMajor.server.Repository;

import com.LearnifyMajor.server.Entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionEntityRepository extends JpaRepository<QuestionEntity, Long> {
}