package com.LearnifyMajor.server.Advice;

import com.LearnifyMajor.server.Exceptions.DuplicateResourceException;
import com.LearnifyMajor.server.Exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;

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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> illegalArguementException(Exception ex){

        ApiError er= ApiError.builder()
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getLocalizedMessage())
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();


        ApiResponse<?> res = ApiResponse.builder().error(er).time(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<?>> DuplicateResourceException(DuplicateResourceException ex){

        ApiError er= ApiError.builder()
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getLocalizedMessage())
                .httpStatus(HttpStatus.CONFLICT)
                .build();


        ApiResponse<?> res = ApiResponse.builder().error(er).time(LocalDateTime.now()).data(Map.of(
                "jobId", ex.getJobId(),
                "status", ex.getStatus()
        )).build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
    }
}
