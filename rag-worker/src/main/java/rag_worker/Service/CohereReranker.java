package rag_worker.Service;
import com.cohere.api.Cohere;
import com.cohere.api.resources.v2.requests.V2RerankRequest;
import com.cohere.api.resources.v2.types.V2RerankResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CohereReranker {
    private final Cohere cohere;

    @Value("${cohere.rerank-model:rerank-v3.5}")
    private String model;

    public List<Document> rerank(String query, List<Document> docs, int topN) {
        if (docs.isEmpty()) return docs;
        log.info("Second stage retrieval for query {}",query);

        V2RerankRequest request = V2RerankRequest.builder()
                .model(model)
                .query(query)
                .documents(docs.stream().map(Document::getText).toList())
                .topN(Math.min(topN, docs.size()))
                .build();

        V2RerankResponse response = cohere.v2().rerank(request);


        return response.getResults().stream()
                .map(r -> docs.get(r.getIndex()).mutate()
                        .score((double) r.getRelevanceScore())
                        .build())
                .toList();
    }

}
