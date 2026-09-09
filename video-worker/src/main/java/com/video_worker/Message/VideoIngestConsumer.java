package com.video_worker.Message;

import com.video_worker.Client.TranscriptionClientService;
import com.video_worker.DTO.TranscriptionRestClientResponseDTO;
import com.video_worker.DTO.VideoIngestMessage;
import com.video_worker.Util.ByteArrayMultipartFileConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import static com.video_worker.Configuration.MessageBrokerConfig.VIDEO_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class VideoIngestConsumer {
    private final TranscriptionClientService transcriptionClientService;
    private final RAGIngestPublisher ragIngestPublisher;
    private final VideoStatusPublisher videoStatusPublisher;

    @RabbitListener(queues = VIDEO_QUEUE)
    public void consume(VideoIngestMessage message) {

        log.info("Picked up job [{}] for material [{}], file '{}'",
                message.getJobId(), message.getMaterialId(), message.getFilename());

        videoStatusPublisher.publish(message.getMaterialId(), "PROCESSING", null);

        try {
            MultipartFile file = new ByteArrayMultipartFileConverter(
                    message.getFileBytes(),
                    message.getFilename(),
                    message.getContentType()
            );

            TranscriptionRestClientResponseDTO transcription = transcriptionClientService.transcript(file);
            String text = transcription.getTranscript();

            if (text == null || text.isBlank()) {
                throw new IllegalStateException("Transcription returned empty text");
            }

            String cleaned = cleanText(text);

            ragIngestPublisher.publish(message.getMaterialId(), message.getJobId(), message.getFilename(), cleaned);

            log.info("Job [{}] transcribed, handed off to rag-worker", message.getJobId());
            // Note: we don't mark DONE here — that only happens once rag-worker
            // actually finishes chunking+embedding. rag-worker publishes the final DONE/FAILED status.

        } catch (Exception e) {
            log.error("Job [{}] failed: {}", message.getJobId(), e.getMessage());
            videoStatusPublisher.publish(message.getMaterialId(), "FAILED", e.getMessage());
        }
    }

    private String cleanText(String text) {
        if (text == null) return "";
        return text
                .replaceAll("\\r", "")
                .replaceAll("\\n+", "\n")
                .replaceAll("-\\n", "")
                .replaceAll("\\s{2,}", " ")
                .replaceAll("[^\\x00-\\x7F]", "")
                .trim();
    }
}
