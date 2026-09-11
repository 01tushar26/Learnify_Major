package rag_worker.Message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static rag_worker.Configuration.MessageBrokerConfig.STATUS_EXCHANGE;
import static rag_worker.Configuration.MessageBrokerConfig.STATUS_ROUTING_KEY;

@Component
@RequiredArgsConstructor
@Slf4j
public class StatusUpdatePublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(Long materialId, String status, String errorMessage) {
        StatusUpdateMessage message = new StatusUpdateMessage(materialId, status, errorMessage);
        log.info("sending message to update the status of material with id -{}",materialId);
        rabbitTemplate.convertAndSend(STATUS_EXCHANGE, STATUS_ROUTING_KEY, message);
    }
}
