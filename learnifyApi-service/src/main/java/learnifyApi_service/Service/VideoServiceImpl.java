package learnifyApi_service.Service;

import learnifyApi_service.DTOs.MaterialDTO;
import learnifyApi_service.Entities.User;
import learnifyApi_service.MessageBroker.VideoIngestPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static learnifyApi_service.Util.Util.getAuthenticatedUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoServiceImpl implements VideoService{

    private final VideoIngestPublisher videoIngestPublisher;

    @Override
    public MaterialDTO uploadVideo(MultipartFile file) throws IOException {
        User currentUser = getAuthenticatedUser();
        return videoIngestPublisher.publish(file,currentUser);
    }
}
