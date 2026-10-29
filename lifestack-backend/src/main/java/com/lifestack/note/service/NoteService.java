package com.lifestack.note.service;

import com.lifestack.coding.entity.Problem;
import com.lifestack.coding.repository.ProblemRepository;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.repository.TopicRepository;
import com.lifestack.note.dto.CreateNoteRequest;
import com.lifestack.note.dto.NoteResponse;
import com.lifestack.note.dto.UpdateNoteRequest;
import com.lifestack.note.entity.Note;
import com.lifestack.note.repository.NoteRepository;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final ProblemRepository problemRepository;

    public NoteService(NoteRepository noteRepository,
                       WorkspaceRepository workspaceRepository,
                       UserRepository userRepository,
                       TopicRepository topicRepository,
                       ProblemRepository problemRepository) {
        this.noteRepository = noteRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.problemRepository = problemRepository;
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listNotes(UUID userId, UUID workspaceId, String search) {
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        return noteRepository.searchNotes(workspaceId, userId, search != null && !search.isBlank() ? search.trim() : null)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(UUID userId, UUID noteId) {
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        return mapToResponse(note);
    }

    @Transactional
    public NoteResponse createNote(UUID userId, CreateNoteRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(request.getWorkspaceId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + request.getWorkspaceId()));

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Note note = new Note(
                workspace,
                owner,
                request.getTitle().trim(),
                request.getContent(),
                request.getTags() != null ? request.getTags().trim() : null
        );

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(request.getTopicId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + request.getTopicId()));
            note.getTopics().add(topic);
        }

        if (request.getProblemId() != null) {
            Problem problem = problemRepository.findByIdAndOwnerId(request.getProblemId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + request.getProblemId()));
            note.getProblems().add(problem);
        }

        Note saved = noteRepository.save(note);
        return mapToResponse(saved);
    }

    @Transactional
    public NoteResponse updateNote(UUID userId, UUID noteId, UpdateNoteRequest request) {
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            note.setTitle(request.getTitle().trim());
        }
        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }
        if (request.getTags() != null) {
            note.setTags(request.getTags().trim());
        }

        Note updated = noteRepository.save(note);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteNote(UUID userId, UUID noteId) {
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        noteRepository.delete(note);
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listNotesByTopic(UUID userId, UUID topicId) {
        topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        return noteRepository.findNotesByTopicId(topicId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void linkNoteToTopic(UUID userId, UUID topicId, UUID noteId) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        note.getTopics().add(topic);
        noteRepository.save(note);
    }

    @Transactional
    public void unlinkNoteFromTopic(UUID userId, UUID topicId, UUID noteId) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        note.getTopics().remove(topic);
        noteRepository.save(note);
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listNotesByProblem(UUID userId, UUID problemId) {
        problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        return noteRepository.findNotesByProblemId(problemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void linkNoteToProblem(UUID userId, UUID problemId, UUID noteId) {
        Problem problem = problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        note.getProblems().add(problem);
        noteRepository.save(note);
    }

    @Transactional
    public void unlinkNoteFromProblem(UUID userId, UUID problemId, UUID noteId) {
        Problem problem = problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        note.getProblems().remove(problem);
        noteRepository.save(note);
    }

    public NoteResponse mapToResponse(Note note) {
        NoteResponse res = new NoteResponse();
        res.setId(note.getId());
        res.setWorkspaceId(note.getWorkspace().getId());
        res.setOwnerId(note.getOwner().getId());
        res.setTitle(note.getTitle());
        res.setContent(note.getContent());
        res.setTags(note.getTags());
        res.setCreatedAt(note.getCreatedAt());
        res.setUpdatedAt(note.getUpdatedAt());
        return res;
    }
}
