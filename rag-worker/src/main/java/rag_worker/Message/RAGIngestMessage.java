package rag_worker.Message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RAGIngestMessage implements Serializable {
    private Long materialId;
    private String jobId;
    private String filename;
    private String sourceType;  // "VIDEO" or "PDF" — lets rag-worker know it's already-extracted text vs raw pdf bytes
    private String extractedText;
}
