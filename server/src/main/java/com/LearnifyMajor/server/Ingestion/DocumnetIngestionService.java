package com.LearnifyMajor.server.Ingestion;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumnetIngestionService {

    private final EmbeddingModel model;

    public float[] getEmbed(String text){
        return model.embed(text);
    }
}
