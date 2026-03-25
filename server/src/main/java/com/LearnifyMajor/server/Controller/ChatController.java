package com.LearnifyMajor.server.Controller;

import com.LearnifyMajor.server.DTO.ChatRequestDto;
import com.LearnifyMajor.server.DTO.ChatResponseDto;
import com.LearnifyMajor.server.DTO.IngestResponseDto;
import com.LearnifyMajor.server.Service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final RagService service;
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDto> chat(@RequestBody ChatRequestDto dto)  {

        return ResponseEntity.ok().body(service.answer(dto.getQuestion(), dto.getFileName()));

    }
}
