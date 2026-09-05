package learnifyApi_service.Repositories;

import learnifyApi_service.Entities.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizEntityRepository extends JpaRepository<QuizEntity, Long> {
    List<QuizEntity> findByMaterialId(Long materialId);

    @Query("SELECT q FROM QuizEntity q WHERE q.material.user.id = :userId")
    List<QuizEntity> findAllByUserId(@Param("userId") Long userId);


}