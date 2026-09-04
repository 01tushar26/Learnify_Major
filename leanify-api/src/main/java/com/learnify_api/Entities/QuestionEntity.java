package com.learnify_api.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "question_entity")
public class QuestionEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String question;

    // Four answer options stored as plain columns
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    // The correct answer — "A", "B", "C", or "D"
    private String correctAnswer;

    // Why this is the correct answer (shown after submission)
    @Column(columnDefinition = "TEXT")
    private String explanation;

    //child or owning side

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private QuizEntity quiz;


}