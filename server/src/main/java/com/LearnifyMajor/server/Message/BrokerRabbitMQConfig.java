package com.LearnifyMajor.server.Message;


import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BrokerRabbitMQConfig {

    public static final String VIDEO_QUEUE       = "video.ingest.queue";
    public static final String VIDEO_EXCHANGE    = "video.ingest.exchange";
    public static final String VIDEO_ROUTING_KEY = "video.ingest";

    @Bean
    public DirectExchange videoExchange() {
        return new DirectExchange(VIDEO_EXCHANGE);
    }

    @Bean
    public Queue videoQueue() {
        return QueueBuilder.durable(VIDEO_QUEUE).build();
    }

    @Bean
    public Binding videoBinding() {
        return BindingBuilder.bind(videoQueue()).to(videoExchange()).with(VIDEO_ROUTING_KEY);
    }

    //store the bytes in form of json in queue (JAVA obj -> Bytes)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
