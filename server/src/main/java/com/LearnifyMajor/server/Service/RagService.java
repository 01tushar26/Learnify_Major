package com.LearnifyMajor.server.Service;

import com.LearnifyMajor.server.DTO.ChatResponseDto;
import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
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

    public ChatResponseDto answer(String question , String fileName) {

        log.info("Answering question: {}", question);

        // QuestionAnswerAdvisor does all of this automatically:
        //   1. Embeds the question using nomic-embed-text
        //   2. Searches PgVector for the top-4 most relevant chunks
        //   3. Injects those chunks into the prompt as context
        //   4. Sends the enriched prompt to Mistral
        String safeFile = fileName.replace("'", "\\'");

        SearchRequest searchRequest = SearchRequest.builder()
                .topK(5)
                .filterExpression("source == '" + safeFile + "'")
                .build();

        QuestionAnswerAdvisor advisor = QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(searchRequest)
                .build();

        String answer = chatClient
                .prompt()
                .advisors(advisor)

                .user(question)
                .call()
                .content();

        log.info("Answer generated successfully");
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