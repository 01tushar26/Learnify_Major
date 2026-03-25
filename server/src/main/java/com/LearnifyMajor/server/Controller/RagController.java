package com.LearnifyMajor.server.Controller;

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
        public ResponseEntity<String> ingest(@RequestParam("file") MultipartFile file) throws IOException {
            return ResponseEntity.ok(ragService.ingest(file));
        }
    }

