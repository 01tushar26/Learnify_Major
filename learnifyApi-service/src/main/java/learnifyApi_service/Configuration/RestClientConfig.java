package learnifyApi_service.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    //ToDO - add the server url
    @Value("${rag-worker.base-url}")
    private String ragServerUrl;

    @Bean
    public RestClient getRestClient(){
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);   // 10 seconds to connect
        factory.setReadTimeout(600_000);

        return RestClient.builder()
                .baseUrl(ragServerUrl)
                .requestFactory(factory)
                .build();
    }
}
