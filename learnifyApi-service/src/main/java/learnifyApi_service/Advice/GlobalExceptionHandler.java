package learnifyApi_service.Advice;


import io.jsonwebtoken.JwtException;
import learnifyApi_service.Exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex){

        ApiError er= ApiError.builder().message(ex.getLocalizedMessage()).httpStatus(HttpStatus.BAD_REQUEST).timestamp(Timestamp.valueOf(LocalDateTime.now())).build();
        ApiResponse<?> res = ApiResponse.builder().error(er).localDateTime(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> internalServerError(Exception ex){

        ApiError er= ApiError.builder().message(ex.getLocalizedMessage()).httpStatus(HttpStatus.INTERNAL_SERVER_ERROR).timestamp(Timestamp.valueOf(LocalDateTime.now())).build();
        ApiResponse<?> res = ApiResponse.builder().error(er).localDateTime(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
    }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(AuthenticationException ex) {
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getMessage())
                .build();
        ApiResponse<?> res = ApiResponse.builder().error(apiError).localDateTime(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<?>> handleJwtException(JwtException ex) {
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getMessage())
                .build();
        ApiResponse<?> res = ApiResponse.builder().error(apiError).localDateTime(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException ex) {
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.FORBIDDEN)
                .timestamp(Timestamp.valueOf(LocalDateTime.now()))
                .message(ex.getMessage())
                .build();
        ApiResponse<?> res = ApiResponse.builder().error(apiError).localDateTime(LocalDateTime.now()).build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(res);
    }
}
