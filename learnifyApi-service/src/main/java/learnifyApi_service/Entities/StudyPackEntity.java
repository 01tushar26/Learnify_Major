package learnifyApi_service.Entities;

import jakarta.persistence.*;
import learnifyApi_service.Entities.Enums.IngestStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "study_pack",
        uniqueConstraints = @UniqueConstraint(name = "uk_study_pack_material", columnNames = "material_id")
)
@Getter
@Setter
@NoArgsConstructor
public class StudyPackEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IngestStatus status;            // PROCESSING / DONE / FAILED

    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String notesJson;

    @Column(columnDefinition = "TEXT")
    private String flashcardsJson;

    private int promptVersion = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}