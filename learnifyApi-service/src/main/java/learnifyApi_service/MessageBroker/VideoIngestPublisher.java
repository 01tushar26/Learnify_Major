package learnifyApi_service.MessageBroker;

import learnifyApi_service.DTOs.MaterialDTO;
import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.Enums.MaterialType;
import learnifyApi_service.Entities.Material;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Exceptions.DuplicateResourceException;
import learnifyApi_service.Repositories.MaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import static learnifyApi_service.Configuration.MessageQueueConfig.VIDEO_EXCHANGE;
import static learnifyApi_service.Configuration.MessageQueueConfig.VIDEO_ROUTING_KEY;

@Component
@RequiredArgsConstructor
@Slf4j
public class VideoIngestPublisher {
    private final ModelMapper mapper;
    private final MaterialRepository materialRepository;
    private final RabbitTemplate rabbitTemplate;

    public MaterialDTO publish(MultipartFile file , User user) throws IOException {

        String fileName = file.getOriginalFilename();

        Material material = materialRepository.findByFileNameAndUserId(fileName, user.getId())
                .map(existing -> {
                    if (existing.getStatus() != IngestStatus.FAILED) {
                        throw new DuplicateResourceException(
                                "File '" + fileName + "' already exists.",
                                existing.getJobId(),
                                existing.getStatus().name()
                        );
                    }
                    log.warn("File '{}' previously failed, re-ingesting.", fileName);
                    existing.setJobId(UUID.randomUUID().toString());
                    existing.setStatus(IngestStatus.QUEUED);
                    existing.setErrorMessage(null);
                    return materialRepository.save(existing);
                })
                .orElseGet(() -> materialRepository.save(
                        Material.builder()
                                .jobId(UUID.randomUUID().toString())
                                .fileName(fileName)
                                .materialType(MaterialType.VIDEO)
                                .status(IngestStatus.QUEUED)
                                .user(user)
                                .build()
                ));
        VideoIngestMessage videoIngestMessage = new VideoIngestMessage(
                material.getId()
                ,material.getJobId()
                ,fileName
                ,file.getBytes()
                ,file.getContentType()
        );
        rabbitTemplate.convertAndSend(VIDEO_EXCHANGE, VIDEO_ROUTING_KEY, videoIngestMessage);
        log.info("Video '{}' queued with jobId={}, materialId={}", fileName, material.getJobId(), material.getId());

        return mapper.map(material, MaterialDTO.class);

    }
}
