package com.LearnifyMajor.server.Service;

import com.LearnifyMajor.server.Client.TranscriptionClientService;
import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.Client.TranscriptionRestClientResponse;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static com.LearnifyMajor.server.Utils.MAX_FILE_SIZE_MB;
import static com.LearnifyMajor.server.Utils.validateFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestServiceImpl implements IngestService {

    private final TranscriptionClientService clientService;
    private final RagService ragService;


    @Override
    public IngestResponseDto ingestVideo(MultipartFile file) throws IOException {
        validateFile(file,"video");

        String filename = file.getOriginalFilename();
        log.info("Starting video ingestion for file: {}", filename);

        TranscriptionRestClientResponse transcription = clientService.transcript(file);
        String text = transcription.getTranscript();

        if (text == null || text.isBlank()) {
            throw new ResourceNotFoundException("Transcription returned empty text");
        }

        Document doc = new Document(cleanText(text), Map.of("source", filename, "type", "transcription"));

        return ragService.chunkAndStore(List.of(doc), filename, 1);

    }

    @Override
    public IngestResponseDto ingestPdf(MultipartFile file) throws IOException {

        validateFile(file,"pdf");

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
        List<Document> cleanedDocuments = documents.stream()
                .map(doc -> {
                    String cleanedText = cleanText(doc.getText());
                    return new Document(cleanedText, doc.getMetadata());
                })
                .toList();
        return ragService.chunkAndStore(cleanedDocuments, filename, documents.size());

    }




    private String cleanText(String text) {
        if (text == null) return "";

        return text
                .replaceAll("\\r", "")
                .replaceAll("\\n+", "\n")           // normalize new lines
                .replaceAll("-\\n", "")             // fix broken words
                .replaceAll("\\s{2,}", " ")         // remove extra spaces
                .replaceAll("[^\\x00-\\x7F]", "")   // remove weird unicode
                .trim();
    }
}
