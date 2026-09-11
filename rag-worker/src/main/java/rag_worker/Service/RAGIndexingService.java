package rag_worker.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RAGIndexingService {
    //Do indexing- 3.CHUNKING AND 4.STORING
    private final VectorStore vectorStore;

    public void chunkAndStore(List<Document> documents, String fileName , Long materialId){

        //chunking
        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(50)
                .withMinChunkLengthToEmbed(200)
                .withMaxNumChunks(20)
                .withKeepSeparator(true)
                .build();

        List<Document> chunks = splitter.apply(documents);

        log.info("Split into {} chunks", chunks.size());
        
        int page = 1;
        for (Document doc : chunks) {
            // materialId is the key filter field — fileName kept too for human-readability/debugging only
            doc.getMetadata().put("materialId", materialId.toString());
            doc.getMetadata().put("source", fileName);
            doc.getMetadata().put("page", page++);
            doc.getMetadata().put("timestamp", System.currentTimeMillis());
        }

        batchInsert(chunks);

        log.info("Stored {} chunks in pgvector for materialId={}", chunks.size(), materialId);
    }

    private void batchInsert(List<Document> chunks) {

        for (int i = 0; i < chunks.size(); i += 100) {
            int end = Math.min(i + 100, chunks.size());
            vectorStore.add(chunks.subList(i, end));
        }
    }
    private String cleanText(String text) {
        if (text == null) return "";
        return text
                .replaceAll("\\r", "")
                .replaceAll("\\n+", "\n")
                .replaceAll("-\\n", "")
                .replaceAll("\\s{2,}", " ")
                .replaceAll("[^\\x00-\\x7F]", "")
                .trim();
    }

    public String clean(String text) {
        return cleanText(text);
    }

}


