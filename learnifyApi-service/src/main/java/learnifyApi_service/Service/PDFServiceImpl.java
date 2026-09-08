package learnifyApi_service.Service;
import learnifyApi_service.DTOs.MaterialDTO;
import learnifyApi_service.Entities.User;
import learnifyApi_service.MessageBroker.PDFIngestPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import static learnifyApi_service.Util.Util.getAuthenticatedUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class PDFServiceImpl implements PDFService {
    private final PDFIngestPublisher publisher;

    @Override
    public MaterialDTO uploadPDF(MultipartFile file) throws IOException {
        User currentUser = getAuthenticatedUser();
        log.info("Video with name {} send to publish",file.getOriginalFilename());
        return publisher.publish(file,currentUser);
    }
}
