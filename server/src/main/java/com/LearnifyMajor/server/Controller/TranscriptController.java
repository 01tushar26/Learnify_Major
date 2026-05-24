package com.LearnifyMajor.server.Controller;


import com.LearnifyMajor.server.DTO.TranscriptionRestClientResponse;
import com.LearnifyMajor.server.Service.TranscriptionClientService;
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
@RequestMapping(path = "/video")
public class TranscriptController {

    private final TranscriptionClientService transcriptionClientService;

    @PostMapping(path = "/transcript")
    public ResponseEntity<TranscriptionRestClientResponse> transcript(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(transcriptionClientService.transcript(file));
    }


}
