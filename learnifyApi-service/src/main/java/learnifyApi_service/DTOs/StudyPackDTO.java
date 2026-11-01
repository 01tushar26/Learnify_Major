package learnifyApi_service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudyPackDTO {
    private String status;            // PROCESSING / DONE / FAILED
    private String errorMessage;
    private NotesDTO notes;
    private List<FlashcardDTO> flashcards;
}
