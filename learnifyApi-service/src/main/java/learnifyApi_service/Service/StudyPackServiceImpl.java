package learnifyApi_service.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import learnifyApi_service.DTOs.FlashcardDTO;
import learnifyApi_service.DTOs.NotesDTO;
import learnifyApi_service.DTOs.StudyPackStatusDTO;
import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.Material;
import learnifyApi_service.Entities.StudyPackEntity;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Exceptions.ResourceNotFoundException;
import learnifyApi_service.MessageBroker.StudyPackRequestMessage;
import learnifyApi_service.Repositories.MaterialRepository;
import learnifyApi_service.Repositories.StudyPackEntityRepository;
import learnifyApi_service.Util.Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import static learnifyApi_service.Configuration.MessageQueueConfig.STUDY_EXCHANGE;
import static learnifyApi_service.Configuration.MessageQueueConfig.STUDY_KEY;

@Service
@Slf4j
@RequiredArgsConstructor
public class StudyPackServiceImpl implements StudyPackService {

    private static final Duration STALE_AFTER = Duration.ofMinutes(15);

    private final MaterialRepository materialRepo;
    private final StudyPackEntityRepository packRepo;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final ModelMapper mapper;

    // Deliberately NOT @Transactional: the row must be committed before the message is published
    @Override
    public StudyPackStatusDTO start(Long materialId) {
        Material material = loadOwned(materialId);
        if (material.getStatus() != IngestStatus.DONE) {
            throw new ResourceNotFoundException("Material is not ready yet, current status: " + material.getStatus());
        }

        StudyPackEntity pack = packRepo.findByMaterialId(materialId).orElse(null);

        if (pack == null) {
            StudyPackEntity fresh = new StudyPackEntity();
            fresh.setMaterial(material);
            fresh.setStatus(IngestStatus.PROCESSING);
            try {
                pack = packRepo.save(fresh);
            } catch (DataIntegrityViolationException e) {        // another request created it first
                StudyPackEntity existing = packRepo.findByMaterialId(materialId)
                        .orElseThrow(() -> new ResourceNotFoundException("Study pack not generated yet"));
                return toStatus(existing);
            }
        } else {
            LocalDateTime now = LocalDateTime.now();
            int won = packRepo.claimForRetry(materialId, IngestStatus.PROCESSING, IngestStatus.FAILED,
                    now, now.minus(STALE_AFTER));
            if (won == 0) return toStatus(pack);                 // DONE, or already running
            pack = packRepo.findByMaterialId(materialId).orElseThrow();
        }

        try {
            rabbitTemplate.convertAndSend(STUDY_EXCHANGE, STUDY_KEY, new StudyPackRequestMessage(materialId));
        } catch (AmqpException e) {                              // broker unreachable
            log.error("Could not publish study pack job for material {}", materialId, e);
            pack.setStatus(IngestStatus.FAILED);
            pack.setErrorMessage("Server is busy, please try again in a minute");
            pack = packRepo.save(pack);
        }
        return toStatus(pack);
    }

    @Override
    public StudyPackStatusDTO getStatus(Long materialId) {
        return toStatus(findOwnedPack(materialId));
    }

    @Override
    public NotesDTO getNotes(Long materialId) {
        StudyPackEntity pack = findDonePack(materialId);
        try {
            return objectMapper.readValue(pack.getNotesJson(), NotesDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Stored notes are corrupted", e);
        }
    }

    @Override
    public List<FlashcardDTO> getFlashcards(Long materialId) {
        StudyPackEntity pack = findDonePack(materialId);
        try {
            return objectMapper.readValue(pack.getFlashcardsJson(), new TypeReference<List<FlashcardDTO>>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Stored flashcards are corrupted", e);
        }
    }

    private StudyPackStatusDTO toStatus(StudyPackEntity pack) {
        return mapper.map(pack, StudyPackStatusDTO.class);
    }

    private StudyPackEntity findOwnedPack(Long materialId) {
        loadOwned(materialId);                                   // ownership check
        return packRepo.findByMaterialId(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Study pack not generated yet"));
    }

    private StudyPackEntity findDonePack(Long materialId) {
        StudyPackEntity pack = findOwnedPack(materialId);
        if (pack.getStatus() != IngestStatus.DONE) {
            throw new ResourceNotFoundException("Study pack is not ready yet");
        }
        return pack;
    }

    private Material loadOwned(Long id) {
        User user = Util.getAuthenticatedUser();
        Material m = materialRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
        if (!m.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("This material doesn't belong to you");
        }
        return m;
    }
}