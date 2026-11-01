package rag_worker.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import rag_worker.Controller.MaterialTextController;
import rag_worker.DTO.MaterialTextDTO;
import rag_worker.Entity.MaterialTextEntity;
import rag_worker.Repositories.MaterialTextEntityRepository;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialTextService {
    private final MaterialTextEntityRepository materialTextEntityRepository;
    private final ModelMapper mapper;


    public MaterialTextDTO getTextById(Long id) {
        MaterialTextEntity materialTextEntity = materialTextEntityRepository.findById(id)
                .orElseThrow(()->new NoSuchElementException("No material exit with id :"+id));
        return mapper.map(materialTextEntity, MaterialTextDTO.class);
    }
}
