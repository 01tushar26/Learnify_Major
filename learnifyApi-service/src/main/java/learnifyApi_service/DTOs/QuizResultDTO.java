package learnifyApi_service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizResultDTO {
    private Long quizId;
    private int totalQuestions;
    private int correctCount;
    private Map<Long, String> correctAnswers;
}
