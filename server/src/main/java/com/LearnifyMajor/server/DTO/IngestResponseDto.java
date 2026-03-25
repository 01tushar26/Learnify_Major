package com.LearnifyMajor.server.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngestResponseDto {
    private String fileName;
    private int chunkSize;
    private int docSize;
}
