package rag_worker.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rag_worker.Entity.MaterialTextEntity;

@Repository
public interface MaterialTextEntityRepository extends JpaRepository<MaterialTextEntity, Long> {
}