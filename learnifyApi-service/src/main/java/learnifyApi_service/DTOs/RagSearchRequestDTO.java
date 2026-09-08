package learnifyApi_service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RagSearchRequestDTO {
    private String query;
    private Long materialId;
    private int topK;

}
