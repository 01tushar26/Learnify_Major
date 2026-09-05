package learnifyApi_service.Advice;

import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.BatchSize;
import org.springframework.http.HttpStatus;

import java.security.Timestamp;

@Data
@Builder
public class ApiError {
    private String messsage;
    private HttpStatus httpStatus;
    private Timestamp timestamp;
}
