package com.LearnifyMajor.server.Message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoIngestMessage implements Serializable {
    private String jobId;
    private String filename;
    private byte[] fileBytes;
    private String contentType;
}
