package com.LearnifyMajor.server.Client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestclientConfig {

    @Bean
    public RestClient getRestClient(){
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);   // 10 seconds to connect
        factory.setReadTimeout(600_000);

        return RestClient.builder()
                .baseUrl("http://transcript-server:8000")
                .requestFactory(factory)
                .build();
    }
}
