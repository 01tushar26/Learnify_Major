package learnifyApi_service.Advice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<t> {
    private t data;
    private LocalDateTime localDateTime;
    private ApiError error;

    ApiResponse(t data ){
        this.data = data;
        this.localDateTime=LocalDateTime.now();
    }
}
