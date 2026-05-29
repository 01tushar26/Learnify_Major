package com.LearnifyMajor.server.Controller;

import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.DTO.VideoDto;
import com.LearnifyMajor.server.Message.VideoIngestPublisher;
import com.LearnifyMajor.server.Service.IngestService;
import com.LearnifyMajor.server.Service.RagService;
import com.LearnifyMajor.server.Service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
        private final VideoIngestPublisher publisher;
        private final VideoService videoService;

        @PostMapping("/ingestVideo")
        public ResponseEntity<VideoDto> ingestVideo(@RequestParam("file") MultipartFile file)  {
            try {
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(publisher.publish(file));
            } catch (IOException e) {
                throw new RuntimeException("Failed to process video");
            }


        }
        @GetMapping("/video/status/{jobId}")
        public ResponseEntity<VideoDto> getStatus(@PathVariable(name = "jobId") String id)  {

            return ResponseEntity.ok(videoService.getVideoStatus(id));



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

