package com.LearnifyMajor.server.Advice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<t> {
    private t data;
    private LocalDateTime time;
    private ApiError error;

    public ApiResponse(t data) {
        this.data = data;
        this.time =LocalDateTime.now();
    }
}
