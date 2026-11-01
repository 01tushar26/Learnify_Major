package learnifyApi_service.Configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class MessageQueueConfig {


    // learnify-api PUBLISHES here. video-worker consumes.

    public static final String VIDEO_EXCHANGE = "video.ingest.exchange";
    public static final String VIDEO_ROUTING_KEY = "video.ingest";


    // learnify-api PUBLISHES here. rag-worker consumes.

    public static final String PDF_EXCHANGE = "pdf.ingest.exchange";
    public static final String PDF_ROUTING_KEY = "pdf.ingest";

    public static final String MATERIAL_DELETED_EXCHANGE = "material.deleted.exchange";
    public static final String MATERIAL_DELETED_ROUTING_KEY = "material.deleted";

    public static final String STUDY_QUEUE    = "study.pack.queue";
    public static final String STUDY_EXCHANGE = "study.pack.exchange";
    public static final String STUDY_KEY      = "study.pack";





    // learnify-api CONSUMES here. video-worker (and later rag-worker, for final DONE) publish.
    // -> Full declaration: exchange + queue + binding, since this service owns the listener.
    public static final String STATUS_QUEUE = "video.status.queue";
    public static final String STATUS_EXCHANGE = "video.status.exchange";
    public static final String STATUS_ROUTING_KEY = "video.status";

    // ---------- Video (publish-only: exchange only) ----------
    @Bean
    public DirectExchange videoExchange() {
        return new DirectExchange(VIDEO_EXCHANGE);
    }

    // ---------- PDF (publish-only: exchange only) ----------
    @Bean
    public DirectExchange pdfExchange() {
        return new DirectExchange(PDF_EXCHANGE);
    }

    // ---------- Video status (consume: full trio) ----------
    @Bean
    public DirectExchange statusExchange() {
        return new DirectExchange(STATUS_EXCHANGE);
    }

    @Bean
    public Queue statusQueue() {
        return QueueBuilder.durable(STATUS_QUEUE).build();
    }
    @Bean
    public DirectExchange materialDeletedExchange() {
        return new DirectExchange(MATERIAL_DELETED_EXCHANGE);
    }

    @Bean
    public Binding statusBinding() {
        return BindingBuilder.bind(statusQueue()).to(statusExchange()).with(STATUS_ROUTING_KEY);
    }

    @Bean
    public DirectExchange studyExchange() { return new DirectExchange(STUDY_EXCHANGE); }

    @Bean
    public Queue studyQueue() { return QueueBuilder.durable(STUDY_QUEUE).build(); }

    @Bean
    public Binding studyBinding() {
        return BindingBuilder.bind(studyQueue()).to(studyExchange()).with(STUDY_KEY);
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
