package learnifyApi_service.DTOs;

import learnifyApi_service.Entities.Enums.IngestStatus;
import lombok.Data;

@Data
public class IngestResponseDTO {
    private Long materialId;
    private String fileName;
    private IngestStatus ingestStatus;
}
