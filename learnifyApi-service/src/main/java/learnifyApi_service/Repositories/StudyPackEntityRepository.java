package learnifyApi_service.Repositories;

import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.StudyPackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface StudyPackEntityRepository extends JpaRepository<StudyPackEntity, Long> {
    Optional<StudyPackEntity> findByMaterialId(Long materialId);

    // Returns 1 only for the single caller that wins the retry claim
    @Modifying
    @Transactional
    @Query("""
        update StudyPackEntity p
           set p.status = :processing, p.errorMessage = null, p.updatedAt = :now
         where p.material.id = :materialId
           and (p.status = :failed or (p.status = :processing and p.updatedAt < :staleBefore))
        """)
    int claimForRetry(@Param("materialId") Long materialId,
                      @Param("processing") IngestStatus processing,
                      @Param("failed") IngestStatus failed,
                      @Param("now") LocalDateTime now,
                      @Param("staleBefore") LocalDateTime staleBefore);

}