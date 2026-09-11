package rag_worker.Message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import rag_worker.Service.RAGIndexingService;

import java.util.List;
import java.util.Map;

import static rag_worker.Configuration.MessageBrokerConfig.RAG_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class RAGIngestConsumer {

    private final RAGIndexingService ragIndexingService;
    private final StatusUpdatePublisher publisher;

    @RabbitListener(queues = RAG_QUEUE)
    public void consume(RAGIngestMessage message){

        log.info("Picked up rag job [{}] for material [{}], source '{}'",
                message.getJobId(), message.getMaterialId(), message.getSourceType());

        try {
            if (message.getExtractedText() == null || message.getExtractedText().isBlank()) {
                throw new IllegalStateException("Extracted text is empty");
            }

            Document doc = new Document(
                    message.getExtractedText(),
                    Map.of("source", message.getFilename(), "type", "transcription")
            );

            ragIndexingService.chunkAndStore(List.of(doc), message.getFilename(), message.getMaterialId());

            publisher.publish(message.getMaterialId(), "DONE", null);
            log.info("Rag job [{}] complete, material [{}] marked DONE", message.getJobId(), message.getMaterialId());

        } catch (Exception e) {
            log.error("Rag job [{}] failed: {}", message.getJobId(), e.getMessage());
            publisher.publish(message.getMaterialId(), "FAILED", e.getMessage());
        }
    }


    }

