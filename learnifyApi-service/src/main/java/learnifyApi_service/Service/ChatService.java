package learnifyApi_service.Service;

import learnifyApi_service.DTOs.ChatResponseDTO;

public interface ChatService {
    ChatResponseDTO answer(String question, Long materialId);
}
