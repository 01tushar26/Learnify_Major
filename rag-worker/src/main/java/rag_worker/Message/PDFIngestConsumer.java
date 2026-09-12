package rag_worker.Message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Component;
import rag_worker.Service.RAGIndexingService;

import java.util.List;

import static rag_worker.Configuration.MessageBrokerConfig.PDF_QUEUE;

@RequiredArgsConstructor
@Component
@Slf4j
public class PDFIngestConsumer {
    private final RAGIndexingService indexingService;
    private final StatusUpdatePublisher publisher;

    @RabbitListener(queues = PDF_QUEUE)
    public void consume(PDFIngestMessage message){

        log.info("Picked up PDF job [{}] for material [{}], file '{}'",
                message.getJobId(), message.getMaterialId(), message.getFilename());

        try {
            ByteArrayResource pdfResource = new ByteArrayResource(message.getFileBytes()) {
                @Override
                public String getFilename() {
                    return message.getFilename();
                }
            };

            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(pdfResource);
            List<Document> documents = pdfReader.get();

            if (documents.isEmpty()) {
                throw new IllegalStateException("No readable content found in PDF");
            }

            log.info("Extracted {} pages from PDF '{}'", documents.size(), message.getFilename());

            List<Document> cleaned = documents.stream()
                    .map(doc -> new Document(
                            indexingService.clean(doc.getText()),
                            doc.getMetadata()
                    ))
                    .toList();

            indexingService.chunkAndStore(cleaned,message.getFilename(),message.getMaterialId());

            publisher.publish(message.getMaterialId(), "DONE", null);
            log.info("PDF job [{}] complete, material [{}] marked DONE", message.getJobId(), message.getMaterialId());

        } catch (Exception e) {
            log.error("PDF job [{}] failed: {}", message.getJobId(), e.getMessage());
            publisher.publish(message.getMaterialId(), "FAILED", e.getMessage());
        }
    }
    }

