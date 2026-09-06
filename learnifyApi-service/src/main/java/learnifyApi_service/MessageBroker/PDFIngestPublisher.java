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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import static learnifyApi_service.Configuration.MessageQueueConfig.PDF_EXCHANGE;
import static learnifyApi_service.Configuration.MessageQueueConfig.PDF_ROUTING_KEY;

@RequiredArgsConstructor
@Slf4j
@Component
public class PDFIngestPublisher {
    private final RabbitTemplate rabbitTemplate;
    private final MaterialRepository materialRepo;
    private final ModelMapper mapper;

    public MaterialDTO publish(MultipartFile file, User user) throws IOException {

        String filename = file.getOriginalFilename();

        Material material = materialRepo.findByFileNameAndUserId(filename, user.getId())
                .map(existing -> {
                    if (existing.getStatus() != IngestStatus.FAILED) {
                        throw new DuplicateResourceException(
                                "File '" + filename + "' already exists.",
                                existing.getJobId(),
                                existing.getStatus().name()
                        );
                    }
                    log.warn("File '{}' previously failed, re-ingesting.", filename);
                    existing.setJobId(UUID.randomUUID().toString());
                    existing.setStatus(IngestStatus.QUEUED);
                    existing.setErrorMessage(null);
                    return materialRepo.save(existing);
                })
                .orElseGet(() -> materialRepo.save(
                        Material.builder()
                                .jobId(UUID.randomUUID().toString())
                                .fileName(filename)
                                .materialType(MaterialType.PDF)
                                .status(IngestStatus.QUEUED)
                                .user(user)
                                .build()
                ));

        PDFIngestMessage message = new PDFIngestMessage(
                material.getId(),
                material.getJobId(),
                filename,
                file.getBytes(),
                file.getContentType()
        );

        rabbitTemplate.convertAndSend(PDF_EXCHANGE, PDF_ROUTING_KEY, message);
        log.info("PDF '{}' queued with jobId={}, materialId={}", filename, material.getJobId(), material.getId());

        return mapper.map(material, MaterialDTO.class);
    }
}
