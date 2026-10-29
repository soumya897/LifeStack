package com.lifestack.template.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.security.SecurityUser;
import com.lifestack.template.dto.*;
import com.lifestack.template.entity.TemplateRecordType;
import com.lifestack.template.service.TemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/templates")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TemplateDetailResponse>> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        TemplateDetailResponse created = templateService.createTemplate(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Template created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> listTemplates(
            @RequestParam UUID workspaceId,
            @RequestParam(required = false) TemplateRecordType recordType,
            @AuthenticationPrincipal SecurityUser principal) {
        List<TemplateResponse> templates = templateService.listTemplates(workspaceId, recordType, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Templates retrieved successfully", templates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateDetailResponse>> getTemplate(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser principal) {
        TemplateDetailResponse template = templateService.getTemplate(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Template retrieved successfully", template));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TemplateResponse>> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTemplateRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        TemplateResponse updated = templateService.updateTemplate(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Template updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser principal) {
        templateService.deleteTemplate(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Template deleted successfully", null));
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<ApiResponse<TemplateVersionResponse>> createVersion(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser principal) {
        TemplateVersionResponse version = templateService.createVersion(id, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Template draft version created successfully", version));
    }

    @GetMapping("/{id}/versions/{versionId}")
    public ResponseEntity<ApiResponse<TemplateVersionResponse>> getVersion(
            @PathVariable UUID id,
            @PathVariable UUID versionId,
            @AuthenticationPrincipal SecurityUser principal) {
        TemplateVersionResponse version = templateService.getVersion(id, versionId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Template version retrieved successfully", version));
    }

    @PostMapping("/{id}/versions/{versionId}/publish")
    public ResponseEntity<ApiResponse<TemplateVersionResponse>> publishVersion(
            @PathVariable UUID id,
            @PathVariable UUID versionId,
            @AuthenticationPrincipal SecurityUser principal) {
        TemplateVersionResponse published = templateService.publishVersion(id, versionId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Template version published successfully", published));
    }

    @PostMapping("/versions/{versionId}/fields")
    public ResponseEntity<ApiResponse<FieldDefinitionResponse>> addField(
            @PathVariable UUID versionId,
            @Valid @RequestBody CreateFieldDefinitionRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        FieldDefinitionResponse field = templateService.addFieldDefinition(versionId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Field definition added successfully", field));
    }

    @PatchMapping("/fields/{fieldId}")
    public ResponseEntity<ApiResponse<FieldDefinitionResponse>> updateField(
            @PathVariable UUID fieldId,
            @Valid @RequestBody UpdateFieldDefinitionRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        FieldDefinitionResponse updated = templateService.updateFieldDefinition(fieldId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Field definition updated successfully", updated));
    }

    @DeleteMapping("/fields/{fieldId}")
    public ResponseEntity<ApiResponse<Void>> deleteField(
            @PathVariable UUID fieldId,
            @AuthenticationPrincipal SecurityUser principal) {
        templateService.deleteFieldDefinition(fieldId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Field definition deleted successfully", null));
    }

    @PutMapping("/versions/{versionId}/fields/reorder")
    public ResponseEntity<ApiResponse<List<FieldDefinitionResponse>>> reorderFields(
            @PathVariable UUID versionId,
            @Valid @RequestBody ReorderFieldsRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        List<FieldDefinitionResponse> reordered = templateService.reorderFieldDefinitions(versionId, request.getFieldIds(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Field definitions reordered successfully", reordered));
    }
}
