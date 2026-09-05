package learnifyApi_service.Repositories;

import learnifyApi_service.Entities.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    Optional<Material> findByJobId(String jobId);
    List<Material> findByUserId(Long userId);
    Optional<Material> findByFileNameAndUserId(String fileName, Long userId);
}