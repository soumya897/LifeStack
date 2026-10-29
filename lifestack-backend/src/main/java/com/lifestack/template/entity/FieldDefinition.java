package com.lifestack.template.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "field_definitions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_field_version_key", columnNames = {"version_id", "field_key"})
})
public class FieldDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "version_id", nullable = false)
    private TemplateVersion version;

    @NotBlank
    @Size(max = 100)
    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String label;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false, length = 50)
    private FieldType fieldType;

    @Column(nullable = false)
    private boolean required = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String config = "{}";

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public FieldDefinition() {
    }

    public FieldDefinition(TemplateVersion version, String fieldKey, String label, FieldType fieldType, boolean required, String config, int sortOrder) {
        this.version = version;
        this.fieldKey = fieldKey;
        this.label = label;
        this.fieldType = fieldType;
        this.required = required;
        this.config = config != null ? config : "{}";
        this.sortOrder = sortOrder;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public TemplateVersion getVersion() {
        return version;
    }

    public void setVersion(TemplateVersion version) {
        this.version = version;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public FieldType getFieldType() {
        return fieldType;
    }

    public void setFieldType(FieldType fieldType) {
        this.fieldType = fieldType;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config != null ? config : "{}";
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
