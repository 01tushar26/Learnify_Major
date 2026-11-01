package rag_worker.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import rag_worker.Entity.MaterialTextEntity;
import rag_worker.Repositories.MaterialTextEntityRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RAGIndexingService {
    //Do indexing- 3.CHUNKING AND 4.STORING
    private final VectorStore vectorStore;
    private final MaterialTextEntityRepository materialTextEntityRepository;

    public void chunkAndStore(List<Document> documents, String fileName , Long materialId){

        //this will store the transcript to a db which is used for the notes and flashcards
        saveFullText(materialId, documents.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n")));

        //chunking
        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(50)
                .withMinChunkLengthToEmbed(200)
                .withMaxNumChunks(500)
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

    public void saveFullText(Long materialId, String text) {
        materialTextEntityRepository.save(new MaterialTextEntity(materialId, text, null));
    }

}


