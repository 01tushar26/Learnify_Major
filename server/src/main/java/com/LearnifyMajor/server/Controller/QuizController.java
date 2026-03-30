package com.LearnifyMajor.server.Controller;

import com.LearnifyMajor.server.DTO.ChatRequestDto;
import com.LearnifyMajor.server.DTO.QuizRequestDto;
import com.LearnifyMajor.server.DTO.QuizResponseDto;
import com.LearnifyMajor.server.Service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService service;

    @PostMapping("/generate")
    public ResponseEntity<QuizResponseDto> generateQuiz(@RequestBody QuizRequestDto dto){
        return ResponseEntity.ok(service.genrateQuiz(dto.getTopic(),dto.getFileName(),dto.getNumberOfQuestions()));
    }


}
