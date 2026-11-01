package learnifyApi_service.Service;

import learnifyApi_service.DTOs.FlashcardDTO;
import learnifyApi_service.DTOs.NotesDTO;
import learnifyApi_service.DTOs.StudyPackDTO;
import learnifyApi_service.DTOs.StudyPackStatusDTO;

import java.util.List;

public interface StudyPackService {
    StudyPackStatusDTO start(Long materialId);
    StudyPackStatusDTO getStatus(Long materialId);
    NotesDTO getNotes(Long materialId);
    List<FlashcardDTO> getFlashcards(Long materialId);
}
