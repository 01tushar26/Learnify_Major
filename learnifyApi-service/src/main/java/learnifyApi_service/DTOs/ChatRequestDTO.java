package learnifyApi_service.DTOs;

import lombok.Data;

@Data
public class ChatRequestDTO {
    private String question;
    private Long materialId;
}
