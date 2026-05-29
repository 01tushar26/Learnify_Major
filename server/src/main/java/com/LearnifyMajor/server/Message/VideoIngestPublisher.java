package com.LearnifyMajor.server.Message;

import com.LearnifyMajor.server.DTO.VideoDto;
import com.LearnifyMajor.server.Entity.Video;
import com.LearnifyMajor.server.Entity.VideoStatus;
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

@Component
@RequiredArgsConstructor
@Slf4j
public class VideoIngestPublisher {


    private final RabbitTemplate rabbitTemplate;
    private final VideoRepository videoRepo;
    private final ModelMapper mapper;

    public VideoDto publish(MultipartFile file) throws IOException {

        String jobId = UUID.randomUUID().toString();
        String filename = file.getOriginalFilename();

        Video video = Video.builder()
                .jobId(jobId)
                .fileName(filename)
                .status(VideoStatus.QUEUED)
                .build();
        video =videoRepo.save(video);

        VideoIngestMessage message = new VideoIngestMessage(
                jobId,
                filename,
                file.getBytes(),
                file.getContentType()
        );

        log.info("Video with job id {} ready to push in queue",jobId);

        rabbitTemplate.convertAndSend(
                VIDEO_EXCHANGE,VIDEO_ROUTING_KEY,message
        );
        log.info("Video '{}' queued with jobId={}", filename, jobId);

        return mapper.map(video,VideoDto.class);
    }

}
