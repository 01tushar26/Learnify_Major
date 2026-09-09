package com.video_worker.Configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessageBrokerConfig {
    // --- Consumes this one ---
    public static final String VIDEO_QUEUE       = "video.ingest.queue";
    public static final String VIDEO_EXCHANGE    = "video.ingest.exchange";
    public static final String VIDEO_ROUTING_KEY = "video.ingest";

    // --- Publishes to rag-worker (only needs the exchange declared, rag-worker owns the queue+binding) ---
    public static final String RAG_EXCHANGE    = "rag.ingest.exchange";
    public static final String RAG_ROUTING_KEY = "rag.ingest";

    // --- Publishes status back to learnify-api (learnify-api owns the queue+binding, we just need the exchange) ---
    public static final String STATUS_EXCHANGE     = "video.status.exchange";
    public static final String STATUS_ROUTING_KEY  = "video.status";

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

    // Publish-only exchanges — no queue/binding declared here, that's owned by the consuming service
    @Bean
    public DirectExchange ragExchange() {
        return new DirectExchange(RAG_EXCHANGE);
    }

    @Bean
    public DirectExchange statusExchange() {
        return new DirectExchange(STATUS_EXCHANGE);
    }

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

