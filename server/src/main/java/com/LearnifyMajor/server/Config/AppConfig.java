package com.LearnifyMajor.server.Config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AppConfig {

    @Bean
    public ChatClient getChatClient(OpenAiChatModel chatModel){
               return ChatClient
                       .builder(chatModel)
                       .defaultSystem("""
                You are a strict question answering system.

                Rules:
                1. Answer ONLY from the provided context.
                2. Do NOT use outside knowledge.
                3. If the answer is not in the context, respond exactly with: I don't know.
                4. Keep the answer short and precise.
                """).build();



    }
    @Bean
    @Primary
    public EmbeddingModel embeddingModel(EmbeddingModel ollamaEmbeddingModel) {
        return ollamaEmbeddingModel;
    }
}
