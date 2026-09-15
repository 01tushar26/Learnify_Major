package rag_worker.Message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.retry.annotation.Recover;
import org.springframework.stereotype.Component;

import static rag_worker.Configuration.MessageBrokerConfig.MATERIAL_DELETED_QUEUE;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaterialDeletedConsumer {

    private final JdbcTemplate jdbcTemplate;

    @RabbitListener(queues = MATERIAL_DELETED_QUEUE)
    public void consume(MaterialDeletedMessage message) {
        int deleted = jdbcTemplate.update(
                "DELETE FROM vector_store WHERE metadata->>'materialId' = ?",
                message.getMaterialId().toString()
        );
        log.info("Deleted {} vector chunks for materialId={}", deleted, message.getMaterialId());
    }
}
