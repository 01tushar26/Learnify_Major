package com.video_worker.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TranscriptionRestClientResponseDTO {
    @JsonProperty("request_id")
    private String requestId;

    private String filename;

    private String language;

    private String transcript;

//    private List<Segment> segmentList;
}