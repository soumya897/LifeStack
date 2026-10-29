package com.lifestack.customrecord.entity;

import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.user.entity.User;
import com.lifestack.workspace.entity.Workspace;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "custom_records")
public class CustomRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_version_id", nullable = false)
    private TemplateVersion templateVersion;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FieldValue> fieldValues = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CustomRecord() {
    }

    public CustomRecord(Workspace workspace, User owner, TemplateVersion templateVersion, String title) {
        this.workspace = workspace;
        this.owner = owner;
        this.templateVersion = templateVersion;
        this.title = title;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public TemplateVersion getTemplateVersion() {
        return templateVersion;
    }

    public void setTemplateVersion(TemplateVersion templateVersion) {
        this.templateVersion = templateVersion;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<FieldValue> getFieldValues() {
        return fieldValues;
    }

    public void setFieldValues(List<FieldValue> fieldValues) {
        this.fieldValues = fieldValues;
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
