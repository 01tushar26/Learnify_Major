package com.video_worker.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Segment {
    private int id;
    private double start;
    private double end;
    private String text;
}
