package com.LearnifyMajor.server.Client;


import com.LearnifyMajor.server.DTO.Segment;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptionRestClientResponse {

    @JsonProperty("request_id")
    private String requestId;

    private String filename;

    private String language;

    private String transcript;

    private List<Segment> segmentList;
}
