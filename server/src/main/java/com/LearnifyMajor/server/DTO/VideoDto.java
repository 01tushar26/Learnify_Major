package com.LearnifyMajor.server.DTO;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoDto {

    private String jobId;
    private String fileName;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;

}
