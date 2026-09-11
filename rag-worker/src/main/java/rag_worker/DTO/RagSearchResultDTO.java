package rag_worker.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RagSearchResultDTO {
    private String text;
    private Double score;
}
