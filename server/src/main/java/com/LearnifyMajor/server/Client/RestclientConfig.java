package com.LearnifyMajor.server.Client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestclientConfig {

   @Value("${transcript.server.url}")
   private String transcriptionServerUrl;
    @Bean
    public RestClient getRestClient(){
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);   // 10 seconds to connect
        factory.setReadTimeout(600_000);

        return RestClient.builder()
                .baseUrl(transcriptionServerUrl)
                .requestFactory(factory)
                .build();
    }
}
