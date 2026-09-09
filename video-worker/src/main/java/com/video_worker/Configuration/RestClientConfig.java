package com.video_worker.Configuration;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${transcription-service.base-url}")
    private String transcriptionServiceBaseUrl;

    @Bean
    public RestClient getRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);   // 10 seconds to connect
        factory.setReadTimeout(600_000);     // 10 minutes — transcription can take a while

        return RestClient.builder()
                .baseUrl(transcriptionServiceBaseUrl)
                .requestFactory(factory)
                .build();
    }
}
