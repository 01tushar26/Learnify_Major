package learnifyApi_service.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import learnifyApi_service.Entities.Enums.IngestStatus;
import learnifyApi_service.Entities.Enums.MaterialType;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String jobId;

    @Column(nullable = false)
    private String fileName;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private IngestStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private String errorMessage;

    //parent or inverse side
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<QuizEntity> quizzes = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

}
