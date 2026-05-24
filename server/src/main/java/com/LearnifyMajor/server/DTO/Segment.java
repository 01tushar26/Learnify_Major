package com.LearnifyMajor.server.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Segment {
    private int id;
    private double start;
    private double end;
    private String text;

}
