package com.lifestack.note.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.note.dto.CreateNoteRequest;
import com.lifestack.note.dto.NoteResponse;
import com.lifestack.note.dto.UpdateNoteRequest;
import com.lifestack.note.service.NoteService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping("/api/v1/notes")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotes(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam UUID workspaceId,
            @RequestParam(required = false) String search) {
        List<NoteResponse> notes = noteService.listNotes(securityUser.getId(), workspaceId, search);
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @GetMapping("/api/v1/notes/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> getNote(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        NoteResponse note = noteService.getNoteById(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(note));
    }

    @PostMapping("/api/v1/notes")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateNoteRequest request) {
        NoteResponse created = noteService.createNote(securityUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note created successfully", created));
    }

    @PatchMapping("/api/v1/notes/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateNoteRequest request) {
        NoteResponse updated = noteService.updateNote(securityUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", updated));
    }

    @DeleteMapping("/api/v1/notes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        noteService.deleteNote(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully", null));
    }

    @GetMapping("/api/v1/topics/{topicId}/notes")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotesByTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId) {
        List<NoteResponse> notes = noteService.listNotesByTopic(securityUser.getId(), topicId);
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @PostMapping("/api/v1/topics/{topicId}/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> linkNoteToTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId,
            @PathVariable UUID noteId) {
        noteService.linkNoteToTopic(securityUser.getId(), topicId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Note linked to topic", null));
    }

    @DeleteMapping("/api/v1/topics/{topicId}/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> unlinkNoteFromTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId,
            @PathVariable UUID noteId) {
        noteService.unlinkNoteFromTopic(securityUser.getId(), topicId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Note unlinked from topic", null));
    }

    @GetMapping("/api/v1/problems/{problemId}/notes")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotesByProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID problemId) {
        List<NoteResponse> notes = noteService.listNotesByProblem(securityUser.getId(), problemId);
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @PostMapping("/api/v1/problems/{problemId}/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> linkNoteToProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID problemId,
            @PathVariable UUID noteId) {
        noteService.linkNoteToProblem(securityUser.getId(), problemId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Note linked to problem", null));
    }

    @DeleteMapping("/api/v1/problems/{problemId}/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> unlinkNoteFromProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID problemId,
            @PathVariable UUID noteId) {
        noteService.unlinkNoteFromProblem(securityUser.getId(), problemId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Note unlinked from problem", null));
    }
}
