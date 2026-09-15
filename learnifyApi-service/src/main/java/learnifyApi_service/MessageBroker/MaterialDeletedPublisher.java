package learnifyApi_service.MessageBroker;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static learnifyApi_service.Configuration.MessageQueueConfig.MATERIAL_DELETED_EXCHANGE;
import static learnifyApi_service.Configuration.MessageQueueConfig.MATERIAL_DELETED_ROUTING_KEY;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaterialDeletedPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(Long materialId) {
        rabbitTemplate.convertAndSend(
                MATERIAL_DELETED_EXCHANGE,
                MATERIAL_DELETED_ROUTING_KEY,
                new MaterialDeletedMessage(materialId)
        );
        log.info("Material with id- {} deleted message pushed in a queue", materialId);

    }
}
