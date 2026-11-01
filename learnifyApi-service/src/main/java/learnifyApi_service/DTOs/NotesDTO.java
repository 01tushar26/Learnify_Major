package learnifyApi_service.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotesDTO {
    private String title;
    private String summary;
    private List<SectionDTO> sections;
}
