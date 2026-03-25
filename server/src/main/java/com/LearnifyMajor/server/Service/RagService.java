package com.LearnifyMajor.server.Service;

import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;

import org.springframework.ai.transformer.splitter.TokenTextSplitter;
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

    public String ingest(MultipartFile file) throws IOException {
        // Basic validation
        if (file.isEmpty()) {
            throw new ResourceNotFoundException("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");

        }


        log.info("Starting ingestion for file: {}", file.getOriginalFilename());

        // 1. Wrap the uploaded bytes so Spring AI can read them

        ByteArrayResource pdfResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        // 2. Read PDF — extracts text page by page into Document objects
        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(pdfResource);
        List<Document> documents = pdfReader.get();
        log.info("Extracted {} pages from PDF", documents.size());
        if (documents.isEmpty()) {
            throw new ResourceNotFoundException("No readable content found in PDF");
        }

        // 3. Split into smaller chunks
        // TokenTextSplitter breaks large pages into ~500 token chunks
        // with 100 token overlap so context is not lost between chunks
        TokenTextSplitter splitter = new TokenTextSplitter();

        List<Document> chunks = splitter.apply(documents);
        log.info("Split into {} chunks", chunks.size());

        //ToDo- add the user id and file name to check from which user the query is generated
        chunks.forEach(doc ->
                doc.getMetadata().put("source", file.getOriginalFilename()
                )
        );

        // 4. Embed + store in one call
        // Spring AI calls Ollama (nomic-embed-text) to embed each chunk
        // then upserts all vectors into PgVector automatically
        vectorStore.add(chunks);
        log.info("Stored {} chunks in PgVector", chunks.size());

        return String.format(
                "Successfully ingested '%s' — %d pages, %d chunks stored.",
                file.getOriginalFilename(), documents.size(), chunks.size()
        );
    }
}
