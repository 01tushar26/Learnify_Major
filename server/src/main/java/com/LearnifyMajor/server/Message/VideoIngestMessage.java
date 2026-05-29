package com.LearnifyMajor.server.Message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoIngestMessage {
    private String jobId;
    private String filename;
    private byte[] fileBytes;
    private String contentType;
}
