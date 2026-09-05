package learnifyApi_service.DTOs;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.Enums.MaterialType;
import learnifyApi_service.Entities.QuizEntity;
import learnifyApi_service.Entities.User;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class MaterialDTO {

    private Long id;
    private String fileName;
    private MaterialType materialType;
    private IngestStatus status;
    private LocalDateTime createdAt;
    private String errorMessage;

}
