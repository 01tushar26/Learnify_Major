package com.LearnifyMajor.server.Service;

import com.LearnifyMajor.server.DTO.IngestResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IngestService {

    public IngestResponseDto ingestVideo(MultipartFile file) throws IOException;
    public IngestResponseDto ingestPdf(MultipartFile file) throws IOException;


}
