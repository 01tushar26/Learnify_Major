package com.LearnifyMajor.server.Controller;

import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.Service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rag")
public class RagController {



        private final RagService ragService;

        @PostMapping("/ingest")
        public ResponseEntity<IngestResponseDto> ingest(@RequestParam("file") MultipartFile file)  {
            try {
               return ResponseEntity.ok(ragService.ingest(file));
            } catch (IOException e) {
               throw new RuntimeException("Failed to process pdf");
            }

        }
    }

