package learnifyApi_service.Controllers;

import learnifyApi_service.DTOs.QuizRequestDTO;
import learnifyApi_service.DTOs.QuizResponseDTO;
import learnifyApi_service.Service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;

    @PostMapping("/generate")
    public ResponseEntity<QuizResponseDTO> generateQuiz(@RequestBody QuizRequestDTO dto) {
        return ResponseEntity.ok(quizService.generateQuiz(dto.getTopic(), dto.getMaterialId(), dto.getNumberOfQuestions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuiz(id));
    }
}
