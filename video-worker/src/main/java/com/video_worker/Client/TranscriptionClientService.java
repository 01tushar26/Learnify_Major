package com.video_worker.Client;

import com.video_worker.DTO.TranscriptionRestClientResponseDTO;
import com.video_worker.Exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranscriptionClientService {
    private final RestClient transcriptionRestClient;

    public TranscriptionRestClientResponseDTO transcript(MultipartFile file) throws IOException {

            if (file == null || file.isEmpty()) {

                throw new ResourceNotFoundException("File is empty");
            }

            String filename = file.getOriginalFilename();

            if (filename == null || (!filename.endsWith(".mp4")
                    && !filename.endsWith(".mkv")
                    && !filename.endsWith(".avi")
                    && !filename.endsWith(".mov"))) {

                throw new IllegalArgumentException(
                        "Unsupported file type: " + filename + ". Allowed: mp4, mkv, avi, mov"
                );
            }

            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            log.info("Sending file '{}' to transcription service", file.getOriginalFilename());

            try {
                TranscriptionRestClientResponseDTO response = transcriptionRestClient.post()
                        .uri("transcribe")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(body)
                        .retrieve()
                        .body(TranscriptionRestClientResponseDTO.class);

                if (response == null) {
                    throw new RuntimeException("Transcription service returned empty response");
                }

                log.info("Transcription done — language: {}, requestId: {}",
                        response.getLanguage(), response.getRequestId());

                return response;

            } catch (ResourceAccessException e) {
                log.error("Transcription service unreachable: {}", e.getMessage());
                throw new RuntimeException("Transcription service is not available", e);

            } catch (RestClientResponseException e) {
                log.error("Transcription service error — status: {}", e.getStatusCode());
                throw new RuntimeException("Transcription service failed: " + e.getStatusCode(), e);
            }
        }
    }

