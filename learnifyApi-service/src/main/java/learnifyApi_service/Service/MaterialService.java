package learnifyApi_service.Service;

import learnifyApi_service.DTOs.MaterialDTO;

import java.util.List;

public interface MaterialService {
    public MaterialDTO getStatus(Long materialId);
    public List<MaterialDTO> getMyMaterial();
}
