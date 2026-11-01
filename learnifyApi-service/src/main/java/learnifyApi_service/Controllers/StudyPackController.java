package learnifyApi_service.Controllers;

import learnifyApi_service.DTOs.FlashcardDTO;
import learnifyApi_service.DTOs.NotesDTO;
import learnifyApi_service.DTOs.StudyPackDTO;
import learnifyApi_service.DTOs.StudyPackStatusDTO;
import learnifyApi_service.Service.StudyPackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/materials/{id}/study")
@RequiredArgsConstructor
public class StudyPackController {

    private final StudyPackService service;

    @PostMapping
    public ResponseEntity<StudyPackStatusDTO> start(@PathVariable Long id) {
        return ResponseEntity.accepted().body(service.start(id));
    }

    @GetMapping
    public ResponseEntity<StudyPackStatusDTO> status(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStatus(id));
    }

    @GetMapping("/notes")
    public ResponseEntity<NotesDTO> notes(@PathVariable Long id) {
        return ResponseEntity.ok(service.getNotes(id));
    }

    @GetMapping("/flashcards")
    public ResponseEntity<List<FlashcardDTO>> flashcards(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFlashcards(id));
    }
}
