package com.video_worker.Message;

import com.video_worker.DTO.RAGIngestMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static com.video_worker.Configuration.MessageBrokerConfig.RAG_EXCHANGE;
import static com.video_worker.Configuration.MessageBrokerConfig.RAG_ROUTING_KEY;

@Component
@RequiredArgsConstructor
public class RAGIngestPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(Long materialId, String jobId, String filename, String extractedText) {
        RAGIngestMessage message = new RAGIngestMessage(materialId, jobId, filename, "VIDEO", extractedText);
        rabbitTemplate.convertAndSend(RAG_EXCHANGE, RAG_ROUTING_KEY, message);
    }
}
