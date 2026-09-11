package rag_worker.Configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessageBrokerConfig {
    // --- PDF: consumes ---
    public static final String PDF_QUEUE       = "pdf.ingest.queue";
    public static final String PDF_EXCHANGE    = "pdf.ingest.exchange";
    public static final String PDF_ROUTING_KEY = "pdf.ingest";

    // --- Rag: consumes (video-worker's handoff) ---
    public static final String RAG_QUEUE       = "rag.ingest.queue";
    public static final String RAG_EXCHANGE    = "rag.ingest.exchange";
    public static final String RAG_ROUTING_KEY = "rag.ingest";

    // --- Status: publish-only ---
    public static final String STATUS_EXCHANGE    = "video.status.exchange";
    public static final String STATUS_ROUTING_KEY = "video.status";

    @Bean
    public DirectExchange pdfExchange() {
        return new DirectExchange(PDF_EXCHANGE);
    }

    @Bean
    public Queue pdfQueue() {
        return QueueBuilder.durable(PDF_QUEUE).build();
    }

    @Bean
    public Binding pdfBinding() {
        return BindingBuilder.bind(pdfQueue()).to(pdfExchange()).with(PDF_ROUTING_KEY);
    }

    @Bean
    public DirectExchange ragExchange() {
        return new DirectExchange(RAG_EXCHANGE);
    }

    @Bean
    public Queue ragQueue() {
        return QueueBuilder.durable(RAG_QUEUE).build();
    }

    @Bean
    public Binding ragBinding() {
        return BindingBuilder.bind(ragQueue()).to(ragExchange()).with(RAG_ROUTING_KEY);
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
