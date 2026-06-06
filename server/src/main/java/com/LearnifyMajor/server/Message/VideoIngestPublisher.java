package com.LearnifyMajor.server.Message;

import com.LearnifyMajor.server.DTO.VideoDto;
import com.LearnifyMajor.server.Entity.Video;
import com.LearnifyMajor.server.Entity.VideoStatus;
import com.LearnifyMajor.server.Exceptions.DuplicateResourceException;
import com.LearnifyMajor.server.Repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import static com.LearnifyMajor.server.Message.BrokerRabbitMQConfig.VIDEO_EXCHANGE;
import static com.LearnifyMajor.server.Message.BrokerRabbitMQConfig.VIDEO_ROUTING_KEY;
import static com.LearnifyMajor.server.Utils.validateFile;

@Component
@RequiredArgsConstructor
@Slf4j
public class VideoIngestPublisher {


    private final RabbitTemplate rabbitTemplate;
    private final VideoRepository videoRepo;
    private final ModelMapper mapper;

    public VideoDto publish(MultipartFile file) throws IOException {

        validateFile(file,"video");
        String filename = file.getOriginalFilename();

        Video video = videoRepo.findByFileName(filename)
                .map(existing -> {
                    if (existing.getStatus() != VideoStatus.FAILED) {
                        throw new DuplicateResourceException(
                                "File '" + filename + "' already exists.",
                                existing.getJobId(),
                                existing.getStatus().name()
                        );
                    }
                    // FAILED — reuse same row, just reset it
                    log.warn("File '{}' previously failed, re-ingesting.", filename);
                    existing.setJobId(UUID.randomUUID().toString());
                    existing.setStatus(VideoStatus.QUEUED);
                    existing.setErrorMessage(null);
                    return videoRepo.save(existing);
                })
                .orElseGet(() -> videoRepo.save(
                        Video.builder()
                                .jobId(UUID.randomUUID().toString())
                                .fileName(filename)
                                .status(VideoStatus.QUEUED)
                                .build()
                ));







        VideoIngestMessage message = new VideoIngestMessage(
                video.getJobId(),
                filename,
                file.getBytes(),
                file.getContentType()
        );

        log.info("Video with job id {} ready to push in queue",video.getJobId());

        rabbitTemplate.convertAndSend(
                VIDEO_EXCHANGE,VIDEO_ROUTING_KEY,message
        );
        log.info("Video '{}' queued with jobId={}", filename, video.getJobId());

        return mapper.map(video,VideoDto.class);
    }

}
