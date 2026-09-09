package com.video_worker.Message;

import com.video_worker.DTO.VideoStatusUpdateMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static com.video_worker.Configuration.MessageBrokerConfig.STATUS_EXCHANGE;
import static com.video_worker.Configuration.MessageBrokerConfig.STATUS_ROUTING_KEY;

@Component
@RequiredArgsConstructor
public class VideoStatusPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(Long materialId,String status , String errorMessage){
        VideoStatusUpdateMessage message =new VideoStatusUpdateMessage(materialId,status,errorMessage);

       rabbitTemplate.convertAndSend(STATUS_EXCHANGE, STATUS_ROUTING_KEY, message);
    }
}
