package learnifyApi_service.Service;

import learnifyApi_service.DTOs.QuizResponseDTO;

public interface QuizService {
    QuizResponseDTO generateQuiz(String topic, Long materialId, int numberOfQuestions);
    QuizResponseDTO getQuiz(Long quizId);
}
