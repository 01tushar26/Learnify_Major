package learnifyApi_service.Service;

import learnifyApi_service.DTOs.QuizResponseDTO;
import learnifyApi_service.DTOs.QuizResultDTO;
import learnifyApi_service.DTOs.QuizSubmissionDTO;

public interface QuizService {
    QuizResponseDTO generateQuiz(String topic, Long materialId, int numberOfQuestions);
    QuizResponseDTO getQuiz(Long quizId);

    QuizResultDTO submitQuiz(QuizSubmissionDTO dto);
}
