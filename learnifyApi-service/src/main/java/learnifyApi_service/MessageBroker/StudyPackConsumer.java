package learnifyApi_service.MessageBroker;


import com.fasterxml.jackson.databind.ObjectMapper;
import learnifyApi_service.Client.RagQueryClient;
import learnifyApi_service.DTOs.StudyPackResult;
import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.StudyPackEntity;
import learnifyApi_service.Repositories.StudyPackEntityRepository;
import learnifyApi_service.Service.StudyPackGeneratorServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import static learnifyApi_service.Configuration.MessageQueueConfig.STUDY_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudyPackConsumer {
    private final StudyPackEntityRepository packRepo;
    private final StudyPackGeneratorServiceImpl generator;
    private final RagQueryClient ragClient;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = STUDY_QUEUE, concurrency = "1-2")
    public void consume(StudyPackRequestMessage msg) {
        Long materialId = msg.getMaterialId();
        StudyPackEntity pack = packRepo.findByMaterialId(materialId).orElse(null);
        if (pack == null || pack.getStatus() == IngestStatus.DONE) return;   // deleted, or duplicate message

        log.info("Generating study pack for material {}", materialId);
        try {
            StudyPackResult result = generator.generate(ragClient.getFullText(materialId));
            pack.setNotesJson(objectMapper.writeValueAsString(result.getNotes()));
            pack.setFlashcardsJson(objectMapper.writeValueAsString(result.getFlashcards()));
            pack.setPromptVersion(StudyPackGeneratorServiceImpl.PROMPT_VERSION);
            pack.setStatus(IngestStatus.DONE);
            pack.setErrorMessage(null);
        } catch (Exception e) {
            log.error("Study pack for material {} failed", materialId, e);
            pack.setStatus(IngestStatus.FAILED);
            pack.setErrorMessage("Could not generate notes. Please try again.");   // details stay in the log
        }
        packRepo.save(pack);    // never rethrow: it would redeliver the message in a loop
    }
}
