package com.LearnifyMajor.server.Advice;

import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.sql.Timestamp;

@Data
@Builder
public class ApiError {
     private String message;
     private Timestamp timestamp;
     private HttpStatus httpStatus;
}
