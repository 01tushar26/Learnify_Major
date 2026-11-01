package rag_worker.Entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialTextEntity {

    @Id
    @Column(name = "material_id")
    private Long materialId;          // same id as Material in learnify-api, so no generated value

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;           // don't use @Lob, on Postgres it stores an oid instead of text

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}