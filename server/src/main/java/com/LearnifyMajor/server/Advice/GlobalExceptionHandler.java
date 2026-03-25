package com.LearnifyMajor.server.Advice;

import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex){

        ApiError error = ApiError.builder()
                .httpStatus(HttpStatus.NOT_FOUND)
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getLocalizedMessage())
                .build();
        ApiResponse<?> response = ApiResponse.builder()
                .error(error)
                .time(LocalDateTime.now())
                .build();


        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> internalServerEroor(Exception ex){

        ApiError er= ApiError.builder()
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getLocalizedMessage())
                .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                .build();


        ApiResponse<?> res = ApiResponse.builder().error(er).time(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
    }
}
