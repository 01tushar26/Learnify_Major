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
import rag_worker.Service.RAGIndexingService;
import rag_worker.Service.RagSearchService;

import java.util.List;

@RestController
@RequestMapping("/internal/search")
@RequiredArgsConstructor
public class SemanticSearchController {
    private final VectorStore vectorStore;
    private final RagSearchService ragSearchService;

    @PostMapping
    public ResponseEntity<List<RagSearchResultDTO>> semanticSearch(@RequestBody RagSearchRequestDTO dto) {
        return ResponseEntity.ok(ragSearchService.search(dto));
    }
}
