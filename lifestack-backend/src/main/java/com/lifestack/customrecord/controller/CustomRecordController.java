package com.lifestack.customrecord.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.customrecord.dto.CreateCustomRecordRequest;
import com.lifestack.customrecord.dto.CustomRecordResponse;
import com.lifestack.customrecord.dto.UpdateCustomRecordRequest;
import com.lifestack.customrecord.service.CustomRecordService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/records")
public class CustomRecordController {

    private final CustomRecordService recordService;

    public CustomRecordController(CustomRecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomRecordResponse>> createRecord(
            @Valid @RequestBody CreateCustomRecordRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        CustomRecordResponse created = recordService.createRecord(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Custom record created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomRecordResponse>>> listRecords(
            @RequestParam UUID workspaceId,
            @RequestParam(required = false) UUID templateId,
            @AuthenticationPrincipal SecurityUser principal) {
        List<CustomRecordResponse> records = recordService.listRecords(workspaceId, templateId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Custom records retrieved successfully", records));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomRecordResponse>> getRecord(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser principal) {
        CustomRecordResponse record = recordService.getRecord(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Custom record retrieved successfully", record));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomRecordResponse>> updateRecord(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomRecordRequest request,
            @AuthenticationPrincipal SecurityUser principal) {
        CustomRecordResponse updated = recordService.updateRecord(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Custom record updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser principal) {
        recordService.deleteRecord(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Custom record deleted successfully", null));
    }
}
