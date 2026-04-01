package com.LearnifyMajor.server.Service;


import com.LearnifyMajor.server.DTO.QuizResponseDto;
import com.LearnifyMajor.server.Entity.QuestionEntity;
import com.LearnifyMajor.server.Entity.QuizEntity;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import com.LearnifyMajor.server.Repository.QuestionEntityRepository;
import com.LearnifyMajor.server.Repository.QuizEntityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final QuizEntityRepository quizRepo;
    private final QuestionEntityRepository questionRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public QuizResponseDto genrateQuiz(String topic, String fileName , int numberOfQuestion){



       if(topic.isEmpty()){
           throw  new ResourceNotFoundException("Topic is Empty");
       }
       if(fileName.isEmpty()){
           throw  new ResourceNotFoundException("Please provide the FILENAME for context");
       }
        //todo- check for the fil eis present in db or not otherwise throw exceptions

        log.info("Generating {} MCQ questions from PDF name- {} and topic- {}", numberOfQuestion,fileName,topic);

        String expandedQuery = topic + " key concepts, definitions, important facts, core ideas";

        SearchRequest searchRequest = SearchRequest.builder()
                .query(expandedQuery)
                .topK(8)
                .filterExpression("source == '" + fileName + "'")
                .build();

        List<Document> docs = vectorStore.similaritySearch(searchRequest);
       List<Document> filteredDocs = docs.stream()
                .filter(d -> d.getScore() != null && d.getScore() > 0.75)
                .limit(5)
                .toList();

        log.info("Retrieved {} documents", docs.size());

        if (docs.isEmpty()) {
            log.warn("No relevant documents found. Returning fallback.");
            throw  new ResourceNotFoundException("No relevant context found for the topic {}"+topic);
        }

        // Log each chunk (important for debugging retrieval quality)
        for (int i = 0; i < docs.size(); i++) {
            Document d = docs.get(i);
            log.info("Chunk {} | score={} | metadata={}",
                    i + 1,
                    d.getScore(),
                    d.getMetadata());
        }

        String context = docs.stream()
                .map(Document::getText)
                .map(String::trim)
                .collect(Collectors.joining("\n\n"));

        log.debug("Final Context Sent to LLM:\n{}", context);

        String prompt = String.format("""
                Based on the provided context below, generate exactly %d multiple choice questions on the topic "%s".
                
                Context :
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
                """, numberOfQuestion,topic,context);

        String rawJson = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        log.info("Raw LLM response received, parsing JSON...");

        // Parse JSON response into a list of intermediate records
        List<Map<String, String>> parsed = parseJson(rawJson);

        // Build and save Quiz entity
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

        //ToDo- Return the quiz in a way that answer of question didnot send to frontend
        return new QuizResponseDto(quiz.getId(),quiz.getCreatedAt(),quiz.getQuestionList());


    }
    private List<Map<String, String>> parseJson(String raw) {
        try {
            if (raw == null || raw.isBlank()) {
                throw new RuntimeException("LLM returned empty response");
            }

            String cleaned = raw.trim();

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
            log.error("Failed to parse LLM JSON response: {}", raw);
            throw new RuntimeException("Failed to parse quiz JSON from LLM", e);
        }
    }
    }



