package com.LearnifyMajor.server.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class ChatRequestDto {
    private String question;
    private String fileName;
}
