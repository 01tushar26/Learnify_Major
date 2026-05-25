package com.LearnifyMajor.server.Controller;

import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.Service.IngestService;
import com.LearnifyMajor.server.Service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequiredArgsConstructor
@RequestMapping("/rag")
public class RagController {



        private final RagService ragService;
        private final IngestService ingestService;

        @PostMapping("/ingestVideo")
        public ResponseEntity<IngestResponseDto> ingestVideo(@RequestParam("file") MultipartFile file)  {
            try {
                return ResponseEntity.ok(ingestService.ingestVideo(file));
            } catch (IOException e) {
                throw new RuntimeException("Failed to process video");
            }


        }
        @PostMapping("/ingestPdf")
        public ResponseEntity<IngestResponseDto> ingestPdf(@RequestParam("file") MultipartFile file)  {
            try {
                return ResponseEntity.ok(ingestService.ingestPdf(file));
            } catch (IOException e) {
                throw new RuntimeException("Failed to process pdf");
            }


        }
    }

