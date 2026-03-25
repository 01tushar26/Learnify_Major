package com.LearnifyMajor.server.Ingestion;

import com.LearnifyMajor.server.Service.IngestDataToVectorStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DocumnetIngestionServiceTest {

    @Autowired
   private  IngestDataToVectorStore service;

    @Test
    public void testVectorService(){
         service.storeEmbedInVector("This is my major project");

    }
}