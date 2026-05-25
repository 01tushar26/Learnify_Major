package com.LearnifyMajor.server.Client;

import com.LearnifyMajor.server.DTO.TranscriptionRestClientResponse;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
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
@Slf4j
@RequiredArgsConstructor
public class TranscriptionClientService {

    private final RestClient restClient;

  public TranscriptionRestClientResponse transcript(MultipartFile file) throws IOException{


      if( file == null || file.isEmpty()){
          throw new ResourceNotFoundException("File is empty");
      }

      String filename = file.getOriginalFilename();

      // Validate file type
      if (filename == null || (!filename.endsWith(".mp4")
              && !filename.endsWith(".mkv")
              && !filename.endsWith(".avi")
              && !filename.endsWith(".mov"))) {

          throw new IllegalArgumentException(
                  "Unsupported file type: " + filename + ". Allowed: mp4, mkv, avi, mov"
          );
      }


//      MultipartFile  →  Java object  →  RestClient has no idea how to send it
//
//      ByteArrayResource  →  just raw bytes + filename  →  RestClient knows how to send it

      //this convert the multipart(Java object) file  into the raw bytes so that it can send easily to the client
      ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
          @Override
          public String getFilename() {
              return filename; // filename is required in multipart
          }
      };

     // this is taken by the python service as a input( in this format)
      MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
      body.add("file", fileResource);

      log.info("Sending file '{}' to transcription service", file.getOriginalFilename());

      try {
          TranscriptionRestClientResponse response = restClient.post()
                  .uri("transcribe")
                  .contentType(MediaType.MULTIPART_FORM_DATA)
                  .body(body)
                  .retrieve()
                  .body(TranscriptionRestClientResponse.class);

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

