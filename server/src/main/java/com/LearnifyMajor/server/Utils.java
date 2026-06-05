package com.LearnifyMajor.server;

import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;

public class Utils {
    public static final int MAX_FILE_SIZE_MB = 100;

    public static void validateFile(MultipartFile file, String type) {
        if (file == null || file.isEmpty()) {
            throw new ResourceNotFoundException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_MB * 1024 * 1024) {
            throw new IllegalArgumentException("File too large (max 100MB)");
        }

        String filename = file.getOriginalFilename();

        if ("pdf".equals(type)) {
            if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
                throw new IllegalArgumentException("Only PDF files are allowed");
            }
        } else if ("video".equals(type)) {
            if (filename == null || (!filename.endsWith(".mp4")
                    && !filename.endsWith(".mkv")
                    && !filename.endsWith(".avi")
                    && !filename.endsWith(".mov"))) {
                throw new IllegalArgumentException(
                        "Unsupported file type. Allowed: mp4, mkv, avi, mov");
            }
        }
    }
}
