package rag_worker.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rag_worker.DTO.RagSearchRequestDTO;
import rag_worker.DTO.RagSearchResultDTO;

import java.util.List;

@RestController
@RequestMapping("/internal/search")
@RequiredArgsConstructor
public class SemanticSearchController {
    private final VectorStore vectorStore;

    @PostMapping
    public ResponseEntity<List<RagSearchResultDTO>> semanticSearch(@RequestBody RagSearchRequestDTO dto) {

        SearchRequest searchRequest = SearchRequest.builder()
                .query(dto.getQuery())
                .topK(dto.getTopK())
                .filterExpression("materialId == '" + dto.getMaterialId() + "'")
                .build();

        List<Document> docs = vectorStore.similaritySearch(searchRequest);

        List<RagSearchResultDTO> results = docs.stream()
                .map(d -> new RagSearchResultDTO(d.getText(), d.getScore()))
                .toList();

        return ResponseEntity.ok(results);
    }
}
