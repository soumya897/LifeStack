package com.lifestack.template.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.template.dto.*;
import com.lifestack.template.entity.*;
import com.lifestack.template.repository.FieldDefinitionRepository;
import com.lifestack.template.repository.TemplateRepository;
import com.lifestack.template.repository.TemplateVersionRepository;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateVersionRepository versionRepository;
    private final FieldDefinitionRepository fieldRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public TemplateService(
            TemplateRepository templateRepository,
            TemplateVersionRepository versionRepository,
            FieldDefinitionRepository fieldRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository) {
        this.templateRepository = templateRepository;
        this.versionRepository = versionRepository;
        this.fieldRepository = fieldRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    public TemplateDetailResponse createTemplate(CreateTemplateRequest req, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Workspace workspace = workspaceRepository.findByIdAndOwnerId(req.getWorkspaceId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        Template template = new Template(
                workspace,
                user,
                req.getName().trim(),
                req.getDescription() != null ? req.getDescription().trim() : null,
                req.getRecordType() != null ? req.getRecordType() : TemplateRecordType.JOB_APPLICATION
        );
        Template saved = templateRepository.save(template);

        // Auto-create initial draft Version 1
        TemplateVersion v1 = new TemplateVersion(saved, 1, TemplateVersionStatus.DRAFT);
        versionRepository.save(v1);

        saved.getVersions().add(v1);
        return TemplateDetailResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> listTemplates(UUID workspaceId, TemplateRecordType recordType, UUID userId) {
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        List<Template> templates = recordType != null
                ? templateRepository.findByWorkspaceIdAndRecordTypeOrderByCreatedAtDesc(workspaceId, recordType)
                : templateRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

        return templates.stream()
                .filter(t -> t.getOwner().getId().equals(userId))
                .map(TemplateResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TemplateDetailResponse getTemplate(UUID templateId, UUID userId) {
        Template template = templateRepository.findByIdAndOwnerId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        return TemplateDetailResponse.fromEntity(template);
    }

    public TemplateResponse updateTemplate(UUID templateId, UpdateTemplateRequest req, UUID userId) {
        Template template = templateRepository.findByIdAndOwnerId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            template.setName(req.getName().trim());
        }
        if (req.getDescription() != null) {
            template.setDescription(req.getDescription().trim());
        }

        return TemplateResponse.fromEntity(templateRepository.save(template));
    }

    public void deleteTemplate(UUID templateId, UUID userId) {
        Template template = templateRepository.findByIdAndOwnerId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        templateRepository.delete(template);
    }

    public TemplateVersionResponse createVersion(UUID templateId, UUID userId) {
        Template template = templateRepository.findByIdAndOwnerId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        List<TemplateVersion> existingVersions = versionRepository.findByTemplateIdOrderByVersionNumberDesc(templateId);
        int nextVersionNumber = 1;
        TemplateVersion latest = null;
        if (!existingVersions.isEmpty()) {
            latest = existingVersions.get(0);
            nextVersionNumber = latest.getVersionNumber() + 1;
        }

        TemplateVersion newVersion = new TemplateVersion(template, nextVersionNumber, TemplateVersionStatus.DRAFT);
        TemplateVersion savedVersion = versionRepository.save(newVersion);

        // Branching: Copy field definitions from previous version into new draft
        if (latest != null && latest.getFieldDefinitions() != null) {
            for (FieldDefinition oldField : latest.getFieldDefinitions()) {
                FieldDefinition copiedField = new FieldDefinition(
                        savedVersion,
                        oldField.getFieldKey(),
                        oldField.getLabel(),
                        oldField.getFieldType(),
                        oldField.isRequired(),
                        oldField.getConfig(),
                        oldField.getSortOrder()
                );
                fieldRepository.save(copiedField);
                savedVersion.getFieldDefinitions().add(copiedField);
            }
        }

        return TemplateVersionResponse.fromEntity(savedVersion);
    }

    public TemplateVersionResponse publishVersion(UUID templateId, UUID versionId, UUID userId) {
        Template template = templateRepository.findByIdAndOwnerId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        TemplateVersion version = versionRepository.findById(versionId)
                .filter(v -> v.getTemplate().getId().equals(template.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));

        if (version.getStatus() != TemplateVersionStatus.DRAFT) {
            throw new IllegalStateException("Only draft template versions can be published.");
        }

        // Archive previously published versions of this template
        List<TemplateVersion> versions = versionRepository.findByTemplateIdOrderByVersionNumberDesc(templateId);
        for (TemplateVersion v : versions) {
            if (v.getStatus() == TemplateVersionStatus.PUBLISHED) {
                v.setStatus(TemplateVersionStatus.ARCHIVED);
                versionRepository.save(v);
            }
        }

        version.setStatus(TemplateVersionStatus.PUBLISHED);
        version.setPublishedAt(Instant.now());
        TemplateVersion saved = versionRepository.save(version);
        return TemplateVersionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public TemplateVersionResponse getVersion(UUID templateId, UUID versionId, UUID userId) {
        Template template = templateRepository.findByIdAndOwnerId(templateId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        TemplateVersion version = versionRepository.findById(versionId)
                .filter(v -> v.getTemplate().getId().equals(template.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));

        return TemplateVersionResponse.fromEntity(version);
    }

    public FieldDefinitionResponse addFieldDefinition(UUID versionId, CreateFieldDefinitionRequest req, UUID userId) {
        TemplateVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));

        if (!version.getTemplate().getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("Template version not found");
        }

        if (version.getStatus() != TemplateVersionStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a published or archived template version. Create a new draft version to make changes.");
        }

        // Check duplicate key
        String key = req.getFieldKey().trim().toLowerCase();
        if (fieldRepository.findByVersionIdAndFieldKey(versionId, key).isPresent()) {
            throw new IllegalArgumentException("Field key '" + key + "' already exists in this template version.");
        }

        FieldDefinition field = new FieldDefinition(
                version,
                key,
                req.getLabel().trim(),
                req.getFieldType(),
                req.isRequired(),
                req.getConfig(),
                req.getSortOrder()
        );
        FieldDefinition saved = fieldRepository.save(field);
        return FieldDefinitionResponse.fromEntity(saved);
    }

    public FieldDefinitionResponse updateFieldDefinition(UUID fieldId, UpdateFieldDefinitionRequest req, UUID userId) {
        FieldDefinition field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field definition not found"));

        TemplateVersion version = field.getVersion();
        if (!version.getTemplate().getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("Field definition not found");
        }

        if (version.getStatus() != TemplateVersionStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a published or archived template version. Create a new draft version to make changes.");
        }

        if (req.getLabel() != null && !req.getLabel().trim().isEmpty()) {
            field.setLabel(req.getLabel().trim());
        }
        if (req.getFieldType() != null) {
            field.setFieldType(req.getFieldType());
        }
        if (req.getRequired() != null) {
            field.setRequired(req.getRequired());
        }
        if (req.getConfig() != null) {
            field.setConfig(req.getConfig());
        }
        if (req.getSortOrder() != null) {
            field.setSortOrder(req.getSortOrder());
        }

        return FieldDefinitionResponse.fromEntity(fieldRepository.save(field));
    }

    public void deleteFieldDefinition(UUID fieldId, UUID userId) {
        FieldDefinition field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field definition not found"));

        TemplateVersion version = field.getVersion();
        if (!version.getTemplate().getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("Field definition not found");
        }

        if (version.getStatus() != TemplateVersionStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a published or archived template version. Create a new draft version to make changes.");
        }

        fieldRepository.delete(field);
    }

    public List<FieldDefinitionResponse> reorderFieldDefinitions(UUID versionId, List<UUID> fieldIds, UUID userId) {
        TemplateVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));

        if (!version.getTemplate().getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("Template version not found");
        }

        if (version.getStatus() != TemplateVersionStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify a published or archived template version.");
        }

        List<FieldDefinition> fields = fieldRepository.findByVersionIdOrderBySortOrderAscCreatedAtAsc(versionId);
        Map<UUID, FieldDefinition> fieldMap = fields.stream()
                .collect(Collectors.toMap(FieldDefinition::getId, f -> f));

        for (int i = 0; i < fieldIds.size(); i++) {
            UUID id = fieldIds.get(i);
            FieldDefinition f = fieldMap.get(id);
            if (f != null) {
                f.setSortOrder(i);
                fieldRepository.save(f);
            }
        }

        return fieldRepository.findByVersionIdOrderBySortOrderAscCreatedAtAsc(versionId).stream()
                .map(FieldDefinitionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
