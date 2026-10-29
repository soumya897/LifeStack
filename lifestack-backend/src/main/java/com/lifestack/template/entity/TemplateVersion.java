package com.lifestack.template.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "template_versions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_template_version", columnNames = {"template_id", "version_number"})
})
public class TemplateVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private Template template;

    @NotNull
    @Column(name = "version_number", nullable = false)
    private int versionNumber = 1;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TemplateVersionStatus status = TemplateVersionStatus.DRAFT;

    @Column(name = "published_at")
    private Instant publishedAt;

    @OneToMany(mappedBy = "version", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, createdAt ASC")
    private List<FieldDefinition> fieldDefinitions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public TemplateVersion() {
    }

    public TemplateVersion(Template template, int versionNumber, TemplateVersionStatus status) {
        this.template = template;
        this.versionNumber = versionNumber;
        this.status = status;
    }

    public boolean isPublished() {
        return this.status == TemplateVersionStatus.PUBLISHED;
    }

    public boolean isDraft() {
        return this.status == TemplateVersionStatus.DRAFT;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Template getTemplate() {
        return template;
    }

    public void setTemplate(Template template) {
        this.template = template;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(int versionNumber) {
        this.versionNumber = versionNumber;
    }

    public TemplateVersionStatus getStatus() {
        return status;
    }

    public void setStatus(TemplateVersionStatus status) {
        this.status = status;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public List<FieldDefinition> getFieldDefinitions() {
        return fieldDefinitions;
    }

    public void setFieldDefinitions(List<FieldDefinition> fieldDefinitions) {
        this.fieldDefinitions = fieldDefinitions;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
