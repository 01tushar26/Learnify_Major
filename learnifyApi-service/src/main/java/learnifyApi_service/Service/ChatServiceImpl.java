package learnifyApi_service.Service;

import learnifyApi_service.Client.RagQueryClient;
import learnifyApi_service.DTOs.ChatResponseDTO;
import learnifyApi_service.DTOs.RagSearchResultDTO;
import learnifyApi_service.Entities.Material;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Exceptions.ResourceNotFoundException;
import learnifyApi_service.Repositories.MaterialRepository;
import learnifyApi_service.Util.Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {
    private RagQueryClient ragQueryClient;
    private MaterialRepository repository;
    private ChatClient chatClient;

    @Override
    public ChatResponseDTO answer(String question, Long materialId) {
        User user = Util.getAuthenticatedUser();
        Material material = repository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id " + materialId));

        if (!material.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("This material doesn't belong to you");
        }
        List<RagSearchResultDTO> resultDTOS = ragQueryClient.search(question,materialId,4);
        if (resultDTOS.isEmpty()) {
            return new ChatResponseDTO("I don't know");
        }
        String context = resultDTOS.stream()
                .map(RagSearchResultDTO::getText)
                .collect(Collectors.joining("\n\n"));

        log.debug("Final Context Sent to LLM:\n{}", context);

        String answer = chatClient
                .prompt()
                .system("""
                You are a strict question answering system.

                Rules:
                1. Answer ONLY from the provided context.
                2. Do NOT use outside knowledge.
                3. If the answer is not present, respond exactly: I don't know.
                4. Keep answers short and precise.
                
                Context:
                """ + context)
                .user(question)
                .call()
                .content();

        log.info("LLM Answer: {}", answer);

        return new ChatResponseDTO(answer);

    }
}
