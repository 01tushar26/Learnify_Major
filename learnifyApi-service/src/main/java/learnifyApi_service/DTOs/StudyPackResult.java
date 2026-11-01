package learnifyApi_service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudyPackResult {
    private NotesDTO notes;
    private List<FlashcardDTO> flashcards;
}
