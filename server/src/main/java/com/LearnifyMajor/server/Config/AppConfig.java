package com.LearnifyMajor.server.Config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public ChatClient getChatClient(OllamaChatModel chatModel){

            return ChatClient.builder(chatModel)
                    .defaultSystem("""
                        You are a helpful teaching assistant.
                        Answer questions based only on the provided context from the uploaded documents.
                        If the answer is not found in the context, say so clearly.
                        Keep answers concise and accurate.
                        """)
                    .build();

    }
}
