package learnifyApi_service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudyPackStatusDTO {
    private String status;          // PROCESSING / DONE / FAILED
    private String errorMessage;
}
