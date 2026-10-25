package rag_worker.Configuration;

import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;


@Configuration
public class HttpClientConfig {

        @Bean
        RestClientCustomizer longerTimeouts() {
            return builder -> builder.requestFactory(
                    ClientHttpRequestFactories.get(
                            ClientHttpRequestFactorySettings.DEFAULTS
                                    .withConnectTimeout(Duration.ofSeconds(10))
                                    .withReadTimeout(Duration.ofMinutes(3))));
        }
    }

