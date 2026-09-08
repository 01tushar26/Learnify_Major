package learnifyApi_service.Controllers;

import learnifyApi_service.DTOs.ChatRequestDTO;
import learnifyApi_service.DTOs.ChatResponseDTO;
import learnifyApi_service.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO dto) {
        return ResponseEntity.ok(chatService.answer(dto.getQuestion(), dto.getMaterialId()));
    }
}
