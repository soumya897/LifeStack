package com.lifestack.customrecord.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.customrecord.dto.CreateCustomRecordRequest;
import com.lifestack.customrecord.dto.CustomRecordResponse;
import com.lifestack.customrecord.dto.UpdateCustomRecordRequest;
import com.lifestack.customrecord.entity.CustomRecord;
import com.lifestack.customrecord.entity.FieldValue;
import com.lifestack.customrecord.repository.CustomRecordRepository;
import com.lifestack.customrecord.repository.FieldValueRepository;
import com.lifestack.template.entity.FieldDefinition;
import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.template.repository.TemplateVersionRepository;
import com.lifestack.template.service.CustomFieldValidatorService;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomRecordService {

    private final CustomRecordRepository recordRepository;
    private final FieldValueRepository fieldValueRepository;
    private final TemplateVersionRepository versionRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final CustomFieldValidatorService validatorService;
    private final ObjectMapper objectMapper;

    public CustomRecordService(
            CustomRecordRepository recordRepository,
            FieldValueRepository fieldValueRepository,
            TemplateVersionRepository versionRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            CustomFieldValidatorService validatorService,
            ObjectMapper objectMapper) {
        this.recordRepository = recordRepository;
        this.fieldValueRepository = fieldValueRepository;
        this.versionRepository = versionRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.validatorService = validatorService;
        this.objectMapper = objectMapper;
    }

    public CustomRecordResponse createRecord(CreateCustomRecordRequest req, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Workspace workspace = workspaceRepository.findByIdAndOwnerId(req.getWorkspaceId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        TemplateVersion version = versionRepository.findById(req.getTemplateVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));

        if (!version.getTemplate().getOwner().getId().equals(userId)) {
            throw new ResourceNotFoundException("Template version not found");
        }

        // Validate custom field values
        validatorService.validateCustomFields(version, req.getFieldValues());

        CustomRecord record = new CustomRecord(workspace, user, version, req.getTitle().trim());
        CustomRecord savedRecord = recordRepository.save(record);

        // Save individual field values
        Map<String, FieldDefinition> defsByKey = new HashMap<>();
        for (FieldDefinition def : version.getFieldDefinitions()) {
            defsByKey.put(def.getFieldKey(), def);
        }

        if (req.getFieldValues() != null) {
            for (Map.Entry<String, Object> entry : req.getFieldValues().entrySet()) {
                FieldDefinition def = defsByKey.get(entry.getKey());
                if (def != null && entry.getValue() != null) {
                    try {
                        String json = objectMapper.writeValueAsString(entry.getValue());
                        FieldValue fv = new FieldValue(savedRecord, def, json);
                        fieldValueRepository.save(fv);
                        savedRecord.getFieldValues().add(fv);
                    } catch (Exception e) {
                        throw new RuntimeException("Error serializing field value", e);
                    }
                }
            }
        }

        return CustomRecordResponse.fromEntity(savedRecord, objectMapper);
    }

    @Transactional(readOnly = true)
    public List<CustomRecordResponse> listRecords(UUID workspaceId, UUID templateId, UUID userId) {
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        List<CustomRecord> records;
        if (templateId != null) {
            records = recordRepository.findByTemplateVersionTemplateIdOrderByCreatedAtDesc(templateId);
        } else {
            records = recordRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        }

        return records.stream()
                .filter(r -> r.getOwner().getId().equals(userId))
                .map(r -> CustomRecordResponse.fromEntity(r, objectMapper))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomRecordResponse getRecord(UUID recordId, UUID userId) {
        CustomRecord record = recordRepository.findByIdAndOwnerId(recordId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom record not found"));
        return CustomRecordResponse.fromEntity(record, objectMapper);
    }

    public CustomRecordResponse updateRecord(UUID recordId, UpdateCustomRecordRequest req, UUID userId) {
        CustomRecord record = recordRepository.findByIdAndOwnerId(recordId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom record not found"));

        if (req.getTitle() != null && !req.getTitle().trim().isEmpty()) {
            record.setTitle(req.getTitle().trim());
        }

        if (req.getFieldValues() != null) {
            TemplateVersion version = record.getTemplateVersion();
            validatorService.validateCustomFields(version, req.getFieldValues());

            Map<String, FieldDefinition> defsByKey = new HashMap<>();
            for (FieldDefinition def : version.getFieldDefinitions()) {
                defsByKey.put(def.getFieldKey(), def);
            }

            Map<UUID, FieldValue> existingFVs = new HashMap<>();
            for (FieldValue fv : record.getFieldValues()) {
                existingFVs.put(fv.getFieldDefinition().getId(), fv);
            }

            for (Map.Entry<String, Object> entry : req.getFieldValues().entrySet()) {
                FieldDefinition def = defsByKey.get(entry.getKey());
                if (def != null) {
                    try {
                        String json = objectMapper.writeValueAsString(entry.getValue());
                        FieldValue fv = existingFVs.get(def.getId());
                        if (fv != null) {
                            fv.setValueJson(json);
                            fieldValueRepository.save(fv);
                        } else {
                            FieldValue newFv = new FieldValue(record, def, json);
                            fieldValueRepository.save(newFv);
                            record.getFieldValues().add(newFv);
                        }
                    } catch (Exception e) {
                        throw new RuntimeException("Error updating field value", e);
                    }
                }
            }
        }

        return CustomRecordResponse.fromEntity(recordRepository.save(record), objectMapper);
    }

    public void deleteRecord(UUID recordId, UUID userId) {
        CustomRecord record = recordRepository.findByIdAndOwnerId(recordId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Custom record not found"));
        recordRepository.delete(record);
    }
}
