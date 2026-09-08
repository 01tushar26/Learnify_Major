package learnifyApi_service.Service;

import learnifyApi_service.DTOs.MaterialDTO;
import learnifyApi_service.Entities.Material;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Exceptions.ResourceNotFoundException;
import learnifyApi_service.Repositories.MaterialRepository;
import learnifyApi_service.Util.Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {
    private final ModelMapper mapper;
    private final MaterialRepository repository;

    @Override
    public MaterialDTO getStatus(Long materialId) {
        Material material = repository.findById(materialId).orElseThrow(()->new ResourceNotFoundException("Material not found"));
        User user = Util.getAuthenticatedUser();

        if(!user.equals(material.getUser())){
            throw new AccessDeniedException("This material did not belong to you");
        }
        return mapper.map(material,MaterialDTO.class);
    }

    @Override
    public List<MaterialDTO> getMyMaterial() {

        User user = Util.getAuthenticatedUser();
        List<Material> materials = repository.findByUserId(user.getId());
        if(materials == null || materials.isEmpty()){
            throw new RuntimeException("No material found");
        }
        return materials.stream()
                .map(a->mapper.map(a,MaterialDTO.class))
                .toList();

    }
}
