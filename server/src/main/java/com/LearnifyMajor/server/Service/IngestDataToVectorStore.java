package com.LearnifyMajor.server.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class IngestDataToVectorStore {

    private final VectorStore vectorStore;

    public void storeEmbedInVector(String text){
        Document doc = new Document(text);
        vectorStore.add(List.of(doc));
    }
}
