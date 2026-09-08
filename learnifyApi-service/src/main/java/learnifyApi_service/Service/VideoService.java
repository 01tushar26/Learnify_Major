package learnifyApi_service.Service;

import learnifyApi_service.DTOs.MaterialDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface VideoService {

    MaterialDTO uploadVideo(MultipartFile file) throws IOException;
}
