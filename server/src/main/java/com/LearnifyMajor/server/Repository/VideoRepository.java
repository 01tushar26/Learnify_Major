package com.LearnifyMajor.server.Repository;

import com.LearnifyMajor.server.Entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
  Optional<Video> findByJobId(String jobId);
}