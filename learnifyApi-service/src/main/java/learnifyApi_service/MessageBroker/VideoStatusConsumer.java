package learnifyApi_service.MessageBroker;

import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.Material;
import learnifyApi_service.Repositories.MaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import static learnifyApi_service.Configuration.MessageQueueConfig.STATUS_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class VideoStatusConsumer {

    private final MaterialRepository repository;

    @RabbitListener(queues = STATUS_QUEUE)
    public void consume(VideoStatusUpdateMessage message){
        log.info("Status update received for material [{}]: {}", message.getMaterialId(), message.getStatus());

        Material material = repository.findById(message.getMaterialId())
                .orElse(null);

        if (material == null) {
            log.warn("Received status update for unknown materialId [{}] — ignoring", message.getMaterialId());
            return;
        }

        IngestStatus newStatus;
        try {
            newStatus = IngestStatus.valueOf(message.getStatus());
            //if the value not matching with our enums.
        } catch (IllegalArgumentException e) {
            log.error("Unknown status value '{}' for material [{}] — ignoring", message.getStatus(), message.getMaterialId());
            return;
        }
        material.setStatus(newStatus);
        if (newStatus == IngestStatus.FAILED) {
            material.setErrorMessage(message.getErrorMessage());
        }
        repository.save(material);
        log.info("Material [{}] updated to status {}", material.getId(), newStatus);
    }

    }

