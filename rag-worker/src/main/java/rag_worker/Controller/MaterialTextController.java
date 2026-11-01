package rag_worker.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rag_worker.DTO.MaterialTextDTO;
import rag_worker.Repositories.MaterialTextEntityRepository;
import rag_worker.Service.MaterialTextService;

@RestController
@RequestMapping("/internal/materials")
@RequiredArgsConstructor
public class MaterialTextController {
    private final MaterialTextService materialTextService;

    @GetMapping("/{id}/text")
    public ResponseEntity<MaterialTextDTO> text(@PathVariable Long id) {
        return ResponseEntity.ok(materialTextService.getTextById(id));
    }
}
