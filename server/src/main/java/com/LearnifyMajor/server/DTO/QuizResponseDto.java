package com.LearnifyMajor.server.DTO;

import com.LearnifyMajor.server.Entity.QuestionEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizResponseDto {
    private Long id;
    private LocalDateTime createdAt;
    List<QuestionEntity> questionList ;
}
