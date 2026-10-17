package rag_worker.Configuration;

import com.cohere.api.Cohere;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CohereConfig {

    @Bean
    public Cohere cohere(@Value("${cohere.api-key}") String apiKey) {
        return Cohere.builder()
                .token(apiKey)
                .build();
    }
}
