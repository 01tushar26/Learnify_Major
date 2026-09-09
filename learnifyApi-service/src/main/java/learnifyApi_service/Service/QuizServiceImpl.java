package learnifyApi_service.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import learnifyApi_service.Client.RagQueryClient;
import learnifyApi_service.DTOs.QuestionDTO;
import learnifyApi_service.DTOs.QuizResponseDTO;
import learnifyApi_service.DTOs.RagSearchResultDTO;
import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.Material;
import learnifyApi_service.Entities.QuestionEntity;
import learnifyApi_service.Entities.QuizEntity;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Exceptions.ResourceNotFoundException;
import learnifyApi_service.Repositories.MaterialRepository;
import learnifyApi_service.Repositories.QuestionEntityRepository;
import learnifyApi_service.Repositories.QuizEntityRepository;
import learnifyApi_service.Util.Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final RagQueryClient client;
    private final MaterialRepository materialRepository;
    private final QuizEntityRepository quizRepo;
    private final QuestionEntityRepository questionRepo;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public QuizResponseDTO generateQuiz(String topic, Long materialId, int numberOfQuestions) {
        User currentUser = Util.getAuthenticatedUser();
        Material material = materialRepository.findById(materialId).orElseThrow(()->new ResourceNotFoundException("Material Not found"));
        if(!material.getUser().getId().equals(currentUser.getId())){
            throw new AccessDeniedException("This material doesn't belong to you");
        }

        if (material.getStatus() != IngestStatus.DONE) {
            throw new ResourceNotFoundException("Material is not ready yet, current status: " + material.getStatus());
        }

        String expandedQuery = topic + " key concepts, definitions, important facts, core ideas";

        List<RagSearchResultDTO> results = client.search(expandedQuery, materialId, 8);

        if (results.isEmpty()) {
            throw new ResourceNotFoundException("No relevant context found for the topic " + topic);
        }
        String context = results.stream()
                .map(RagSearchResultDTO::getText)
                .collect(Collectors.joining("\n\n"));

        String prompt = String.format("""
                Based on the provided context below, generate exactly %d multiple choice questions on the topic "%s".

                Context:
                %s

                Rules:
                - Each question must be based strictly on the document content
                - Each question must have exactly 4 options labeled A, B, C, D
                - Only one option must be correct
                - Include a brief explanation for why the correct answer is right

                Return ONLY a valid JSON array. No extra text, no markdown, no code blocks.
                Use exactly this structure:
                [
                  {
                    "question": "Question text here?",
                    "optionA": "First option",
                    "optionB": "Second option",
                    "optionC": "Third option",
                    "optionD": "Fourth option",
                    "correctAnswer": "A",
                    "explanation": "Brief explanation here"
                  }
                ]
                """, numberOfQuestions, topic, context);

        String rawJson = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        log.info("Raw LLM response received, parsing JSON...");

        // Parse JSON response into a list of intermediate records
        List<Map<String, String>> parsed = parseJson(rawJson);

        QuizEntity quiz = new QuizEntity();
        quiz = quizRepo.save(quiz);  // save first to get the ID

        List<QuestionEntity> questions = new ArrayList<>();
        for (Map<String, String> item : parsed) {
            QuestionEntity q = new QuestionEntity();
            q.setQuestion(item.get("question"));
            q.setOptionA(item.get("optionA"));
            q.setOptionB(item.get("optionB"));
            q.setOptionC(item.get("optionC"));
            q.setOptionD(item.get("optionD"));
            q.setCorrectAnswer(item.get("correctAnswer").toUpperCase());
            q.setExplanation(item.get("explanation"));
            q.setQuiz(quiz);
            questions.add(q);
        }

        questionRepo.saveAll(questions);
        quiz.setQuestionList(questions);

        log.info("Saved quiz {} with {} questions", quiz.getId(), questions.size());

        return toDto(quiz);


    }

    private QuizResponseDTO toDto(QuizEntity quiz) {
        List<QuestionDTO> questionDtos = quiz.getQuestionList().stream()
                .map(q -> new QuestionDTO(
                        q.getId(), q.getQuestion(),
                        q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()
                ))
                .toList();

        return new QuizResponseDTO(quiz.getId(), quiz.getCreatedAt(), questionDtos);
    }

    private List<Map<String, String>> parseJson(String rawJson) {
        try {
            if (rawJson == null || rawJson.isBlank()) {
                throw new RuntimeException("LLM returned empty response");
            }

            String cleaned = rawJson.trim();

            // Remove markdown code blocks if model adds them (it will, because why follow rules)
            if (cleaned.startsWith("```")) {
                cleaned = cleaned
                        .replaceAll("^```[a-zA-Z]*\\n?", "")
                        .replaceAll("```$", "")
                        .trim();
            }

            // Sometimes model adds text before JSON → handle that
            int start = cleaned.indexOf("[");
            int end = cleaned.lastIndexOf("]");

            if (start != -1 && end != -1) {
                cleaned = cleaned.substring(start, end + 1);
            }

            return objectMapper.readValue(
                    cleaned,
                    new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, String>>>() {}
            );

        } catch (Exception e) {
            log.error("Failed to parse LLM JSON response: {}", rawJson);
            throw new RuntimeException("Failed to parse quiz JSON from LLM", e);
        }
    }

    @Override
    public QuizResponseDTO getQuiz(Long quizId) {
        User user = Util.getAuthenticatedUser();

        QuizEntity quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id " + quizId));

        if (!quiz.getMaterial().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("This quiz doesn't belong to you");
        }

        return toDto(quiz);
    }


}
