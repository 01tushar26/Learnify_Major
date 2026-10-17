package rag_worker.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import rag_worker.DTO.RagSearchRequestDTO;
import rag_worker.DTO.RagSearchResultDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagSearchService {
    private final VectorStore vectorStore;
    private final CohereReranker reranker;

    public List<RagSearchResultDTO> search(RagSearchRequestDTO dto) {



        // Stage 1: fetch more candidates than needed
        SearchRequest searchRequest = SearchRequest.builder()
                .query(dto.getQuery())
                .topK(dto.getTopK() * 5)
                .filterExpression("materialId == '" + dto.getMaterialId() + "'")
                .build();

        List<Document> candidates = vectorStore.similaritySearch(searchRequest);
        log.info("Bi encoder first stage retrieval done");
        // Stage 2: rerank and keep the best topK
        List<Document> reranked = reranker.rerank(dto.getQuery(), candidates, dto.getTopK());
        log.info("Cross encoder reranking completed");
        return reranked.stream()
                .map(d -> new RagSearchResultDTO(d.getText(), d.getScore()))
                .toList();
    }

}
