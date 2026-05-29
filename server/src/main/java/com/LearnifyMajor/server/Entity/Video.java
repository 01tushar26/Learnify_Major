package com.LearnifyMajor.server.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String jobId;       // UUID to track the async job

    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VideoStatus status;      // QUEUED, PROCESSING, DONE, FAILED

    private String errorMessage; // populated if status = FAILED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
