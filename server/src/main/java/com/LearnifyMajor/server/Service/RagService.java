package com.LearnifyMajor.server.Service;

import com.LearnifyMajor.server.DTO.ChatResponseDto;
import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;

import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.List;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;


    private static final int MAX_FILE_SIZE_MB = 10;

    public IngestResponseDto ingest(MultipartFile file) throws IOException {


        validateFile(file);

        String filename = file.getOriginalFilename();
        log.info("Starting ingestion for file: {}", filename);


        ByteArrayResource pdfResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return filename;
            }
        };


        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(pdfResource);
        List<Document> documents = pdfReader.get();

        if (documents.isEmpty()) {
            throw new ResourceNotFoundException("No readable content found in PDF");
        }

        log.info("Extracted {} pages from PDF", documents.size());

//        // 4. Clean text (important!)
//        for (Document document : documents) {
//            String cleanedText = document.
//
//        }


        TokenTextSplitter splitter = new TokenTextSplitter();
        List<Document> chunks = splitter.apply(documents);

        log.info("Split into {} chunks", chunks.size());


        int page = 1;
        //Todo- add user id in meta data later
        for (Document doc : chunks) {
            doc.getMetadata().put("source", filename);
            doc.getMetadata().put("page", page++);
            doc.getMetadata().put("timestamp", System.currentTimeMillis());
        }


        batchInsert(chunks, 100);

        log.info("Stored {} chunks in PgVector", chunks.size());

          return new IngestResponseDto(filename, chunks.size(), documents.size());

    }

    public ChatResponseDto answer(String question, String fileName) {

        log.info("📥 Incoming question: {}", question);
        log.info("📄 Filtering on file: {}", fileName);

        SearchRequest searchRequest = SearchRequest.builder()
                .query(question)
                .topK(4)
                .filterExpression("source == '" + fileName + "'")
                .build();

        log.info("🔍 SearchRequest: {}", searchRequest);

        List<Document> docs = vectorStore.similaritySearch(searchRequest);

        log.info("📊 Retrieved {} documents", docs.size());

        if (docs.isEmpty()) {
            log.warn("⚠️ No relevant documents found. Returning fallback.");
            return new ChatResponseDto("I don't know");
        }

        // Log each chunk (important for debugging retrieval quality)
        for (int i = 0; i < docs.size(); i++) {
            Document d = docs.get(i);
            log.info("📄 Chunk {} | score={} | metadata={}",
                    i + 1,
                    d.getScore(),
                    d.getMetadata());
        }

        String context = docs.stream()
                .map(Document::getText)
                .map(String::trim)
                .collect(Collectors.joining("\n\n"));

        log.debug("🧠 Final Context Sent to LLM:\n{}", context);

        String answer = chatClient
                .prompt()
                .system("""
                You are a strict question answering system.

                Rules:
                1. Answer ONLY from the provided context.
                2. Do NOT use outside knowledge.
                3. If the answer is not present, respond exactly: I don't know.
                4. Keep answers short and precise.

                Context:
                """ + context)
                .user(question)
                .call()
                .content();

        log.info("🤖 LLM Answer: {}", answer);

        return new ChatResponseDto(answer);
    }



    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResourceNotFoundException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_MB * 1024 * 1024) {
            throw new IllegalArgumentException("File too large (max 10MB)");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }


//    private String cleanText(String text) {
//        return text
//                .replaceAll("\\s+", " ")        // remove extra spaces
//                .replaceAll("-\\n", "")        // fix hyphen line breaks
//                .replaceAll("\\n", " ")        // remove newlines
//                .trim();
//    }


    private void batchInsert(List<Document> chunks, int batchSize) {
        for (int i = 0; i < chunks.size(); i += batchSize) {
            int end = Math.min(i + batchSize, chunks.size());
            List<Document> batch = chunks.subList(i, end);
            vectorStore.add(batch);
        }
    }
}