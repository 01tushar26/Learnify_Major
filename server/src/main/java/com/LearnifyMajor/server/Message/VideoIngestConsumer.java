package com.LearnifyMajor.server.Message;

import com.LearnifyMajor.server.Entity.Video;
import com.LearnifyMajor.server.Entity.VideoStatus;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import com.LearnifyMajor.server.Repository.VideoRepository;
import com.LearnifyMajor.server.Service.IngestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


import static com.LearnifyMajor.server.Message.BrokerRabbitMQConfig.VIDEO_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class VideoIngestConsumer {

    private final IngestService ingestService;
    private final VideoRepository videoRepo;

    @RabbitListener(queues = VIDEO_QUEUE)
    public void consume(VideoIngestMessage message) throws IOException {

        log.info("Picked up job [{}] for file '{}'", message.getJobId(), message.getFilename());

        Video video = videoRepo.findByJobId(message.getJobId())
                .orElseThrow(
                        ()->new ResourceNotFoundException(
                                "Video with Job id : "+message.getJobId()+" not found"));

        video.setStatus(VideoStatus.PROCESSING);
        videoRepo.save(video);

        try {
            //the file is transfer as byte from the queue( JSON format)
            // Rebuild MultipartFile from raw bytes
            MultipartFile file = new ByteArrayMultipartFileConverter(
                    message.getFileBytes(),
                    message.getFilename(),
                    message.getContentType()
            );

            ingestService.ingestVideo(file);

            video.setStatus(VideoStatus.DONE);
            videoRepo.save(video);
            log.info("Job [{}] done", message.getJobId());
        } catch (Exception e){

            log.error("Job [{}] failed: {}", message.getJobId(), e.getMessage());

            video.setStatus(VideoStatus.FAILED);
            video.setErrorMessage(e.getMessage());
            videoRepo.save(video);
        }





    }
}
