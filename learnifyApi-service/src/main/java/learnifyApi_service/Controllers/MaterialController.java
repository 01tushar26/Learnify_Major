package learnifyApi_service.Controllers;

import learnifyApi_service.DTOs.MaterialDTO;
import learnifyApi_service.Service.MaterialService;
import learnifyApi_service.Service.MaterialSseService;
import learnifyApi_service.Service.PDFService;
import learnifyApi_service.Service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final VideoService videoService;
    private final PDFService pdfService;
    private final MaterialService materialService;
    private final MaterialSseService sseService;

     @PostMapping("/video")
    public ResponseEntity<MaterialDTO> uploadVideo(@RequestParam("file") MultipartFile file) throws IOException{
         MaterialDTO dto = videoService.uploadVideo(file);
         return ResponseEntity.status(HttpStatus.ACCEPTED).body(dto);
     }

    @PostMapping("/pdf")
    public ResponseEntity<MaterialDTO> uploadPDF(@RequestParam("file") MultipartFile file) throws IOException{
         MaterialDTO dto = pdfService.uploadPDF(file);
         return ResponseEntity.status(HttpStatus.ACCEPTED).body(dto);
     }

     @GetMapping("/{id}/status")
     public ResponseEntity<MaterialDTO> getStatus(@PathVariable("id") Long id) throws IOException{
         MaterialDTO dto = materialService.getStatus(id);
         return ResponseEntity.status(HttpStatus.OK).body(dto);
     }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter events() {
        return sseService.subscribe();
    }

     @GetMapping()
     public ResponseEntity<List<MaterialDTO>> getMyMaterial() throws IOException{
         List<MaterialDTO> dto = materialService.getMyMaterial();
         return ResponseEntity.status(HttpStatus.OK).body(dto);
     }
     @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id){
         materialService.deleteMaterial(id);
         return ResponseEntity.noContent().build();
     }
}
