package com.lifestack.job.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.job.dto.*;
import com.lifestack.job.entity.ApplicationHistory;
import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.InterviewStatus;
import com.lifestack.job.entity.JobApplication;
import com.lifestack.job.repository.ApplicationHistoryRepository;
import com.lifestack.job.repository.InterviewEventRepository;
import com.lifestack.job.repository.JobApplicationRepository;
import com.lifestack.note.entity.Note;
import com.lifestack.note.repository.NoteRepository;
import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.template.repository.TemplateVersionRepository;
import com.lifestack.template.service.CustomFieldValidatorService;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final InterviewEventRepository interviewEventRepository;
    private final ApplicationHistoryRepository historyRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final TemplateVersionRepository versionRepository;
    private final CustomFieldValidatorService validatorService;
    private final ObjectMapper objectMapper;

    private static final Set<ApplicationStatus> TERMINAL_STATUSES = EnumSet.of(
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.HIRED
    );

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 InterviewEventRepository interviewEventRepository,
                                 ApplicationHistoryRepository historyRepository,
                                 WorkspaceRepository workspaceRepository,
                                 UserRepository userRepository,
                                 NoteRepository noteRepository,
                                 TemplateVersionRepository versionRepository,
                                 CustomFieldValidatorService validatorService,
                                 ObjectMapper objectMapper) {
        this.applicationRepository = applicationRepository;
        this.interviewEventRepository = interviewEventRepository;
        this.historyRepository = historyRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.versionRepository = versionRepository;
        this.validatorService = validatorService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplications(UUID userId, UUID workspaceId,
                                                    ApplicationStatus status, String source,
                                                    String search, Pageable pageable) {
        Workspace workspace = resolveWorkspace(userId, workspaceId);

        Page<JobApplication> page;
        if (search != null && !search.isBlank()) {
            page = applicationRepository.searchApplications(workspace.getId(), search.trim(), pageable);
        } else if (status != null && source != null && !source.isBlank()) {
            page = applicationRepository.findByWorkspaceIdAndStatusAndSource(workspace.getId(), status, source.trim(), pageable);
        } else if (status != null) {
            page = applicationRepository.findByWorkspaceIdAndStatus(workspace.getId(), status, pageable);
        } else if (source != null && !source.isBlank()) {
            page = applicationRepository.findByWorkspaceIdAndSource(workspace.getId(), source.trim(), pageable);
        } else {
            page = applicationRepository.findByWorkspaceId(workspace.getId(), pageable);
        }

        return page.map(ApplicationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplication(UUID userId, UUID applicationId) {
        JobApplication app = findApplicationOwnedByUser(userId, applicationId);
        return ApplicationDetailResponse.fromEntity(app);
    }

    @Transactional
    public ApplicationResponse createApplication(UUID userId, CreateApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Workspace workspace = resolveWorkspace(userId, request.getWorkspaceId());

        JobApplication app = new JobApplication(
                workspace,
                user,
                request.getCompanyName().trim(),
                request.getJobTitle().trim(),
                request.getSource() != null ? request.getSource().trim() : null,
                request.getJobUrl() != null ? request.getJobUrl().trim() : null,
                request.getAppliedAt() != null ? request.getAppliedAt() : LocalDate.now(),
                request.getStatus() != null ? request.getStatus() : ApplicationStatus.APPLIED,
                request.getLocation() != null ? request.getLocation().trim() : null,
                request.getWorkMode(),
                request.getSalary() != null ? request.getSalary().trim() : null,
                request.getNotes(),
                request.getFollowUpAt()
        );

        if (request.getTemplateVersionId() != null) {
            TemplateVersion version = versionRepository.findById(request.getTemplateVersionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));
            if (!version.getTemplate().getOwner().getId().equals(userId)) {
                throw new ResourceNotFoundException("Template version not found");
            }
            validatorService.validateCustomFields(version, request.getCustomFields());
            app.setTemplateVersion(version);
            try {
                app.setCustomFields(objectMapper.writeValueAsString(request.getCustomFields()));
            } catch (Exception e) {
                throw new RuntimeException("Error serializing custom fields", e);
            }
        }

        JobApplication saved = applicationRepository.save(app);

        // Record initial history
        String historyNote = request.getInitialHistoryNote() != null && !request.getInitialHistoryNote().isBlank()
                ? request.getInitialHistoryNote().trim()
                : "Application created in state " + saved.getStatus();
        ApplicationHistory history = new ApplicationHistory(saved, null, saved.getStatus(), historyNote);
        historyRepository.save(history);

        return ApplicationResponse.fromEntity(saved);
    }

    @Transactional
    public ApplicationResponse updateApplication(UUID userId, UUID applicationId, UpdateApplicationRequest request) {
        JobApplication app = findApplicationOwnedByUser(userId, applicationId);

        if (request.getStatus() != null && request.getStatus() != app.getStatus()) {
            ApplicationStatus oldStatus = app.getStatus();
            app.setStatus(request.getStatus());

            String note = request.getStatusChangeNote() != null && !request.getStatusChangeNote().isBlank()
                    ? request.getStatusChangeNote().trim()
                    : "Status moved from " + oldStatus + " to " + request.getStatus();

            ApplicationHistory history = new ApplicationHistory(app, oldStatus, request.getStatus(), note);
            historyRepository.save(history);
        }

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            app.setCompanyName(request.getCompanyName().trim());
        }
        if (request.getJobTitle() != null && !request.getJobTitle().isBlank()) {
            app.setJobTitle(request.getJobTitle().trim());
        }
        if (request.getSource() != null) {
            app.setSource(request.getSource().trim());
        }
        if (request.getJobUrl() != null) {
            app.setJobUrl(request.getJobUrl().trim());
        }
        if (request.getAppliedAt() != null) {
            app.setAppliedAt(request.getAppliedAt());
        }
        if (request.getLocation() != null) {
            app.setLocation(request.getLocation().trim());
        }
        if (request.getWorkMode() != null) {
            app.setWorkMode(request.getWorkMode());
        }
        if (request.getSalary() != null) {
            app.setSalary(request.getSalary().trim());
        }
        if (request.getNotes() != null) {
            app.setNotes(request.getNotes());
        }
        if (request.getFollowUpAt() != null) {
            app.setFollowUpAt(request.getFollowUpAt());
        }

        if (request.getTemplateVersionId() != null) {
            TemplateVersion version = versionRepository.findById(request.getTemplateVersionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template version not found"));
            if (!version.getTemplate().getOwner().getId().equals(userId)) {
                throw new ResourceNotFoundException("Template version not found");
            }
            app.setTemplateVersion(version);
        }

        if (request.getCustomFields() != null) {
            TemplateVersion version = app.getTemplateVersion();
            if (version != null) {
                validatorService.validateCustomFields(version, request.getCustomFields());
            }
            try {
                app.setCustomFields(objectMapper.writeValueAsString(request.getCustomFields()));
            } catch (Exception e) {
                throw new RuntimeException("Error serializing custom fields", e);
            }
        }

        JobApplication updated = applicationRepository.save(app);
        return ApplicationResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteApplication(UUID userId, UUID applicationId) {
        JobApplication app = findApplicationOwnedByUser(userId, applicationId);
        applicationRepository.delete(app);
    }

    @Transactional
    public void attachNote(UUID userId, UUID applicationId, UUID noteId) {
        JobApplication app = findApplicationOwnedByUser(userId, applicationId);
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));
        app.getAttachedNotes().add(note);
        applicationRepository.save(app);
    }

    @Transactional
    public void detachNote(UUID userId, UUID applicationId, UUID noteId) {
        JobApplication app = findApplicationOwnedByUser(userId, applicationId);
        Note note = noteRepository.findByIdAndOwnerId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));
        app.getAttachedNotes().remove(note);
        applicationRepository.save(app);
    }

    @Transactional(readOnly = true)
    public JobStatsSummaryResponse getJobStatsSummary(UUID userId, UUID workspaceId) {
        Workspace workspace = resolveWorkspace(userId, workspaceId);

        JobStatsSummaryResponse stats = new JobStatsSummaryResponse();

        long total = applicationRepository.countByWorkspaceId(workspace.getId());
        stats.setTotalApplications(total);

        // Applied this month
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        long appliedThisMonth = applicationRepository.countByWorkspaceIdAndAppliedAtBetween(
                workspace.getId(), startOfMonth, endOfMonth);
        stats.setAppliedThisMonth(appliedThisMonth);

        // Active upcoming interviews
        long upcoming = interviewEventRepository.countByApplicationWorkspaceIdAndScheduledAtGreaterThanEqualAndStatus(
                workspace.getId(), Instant.now(), InterviewStatus.SCHEDULED);
        stats.setActiveInterviews(upcoming);

        // Offers and Rejections
        long offers = applicationRepository.countByWorkspaceIdAndStatus(workspace.getId(), ApplicationStatus.OFFER)
                    + applicationRepository.countByWorkspaceIdAndStatus(workspace.getId(), ApplicationStatus.HIRED);
        stats.setOffersCount(offers);

        long rejections = applicationRepository.countByWorkspaceIdAndStatus(workspace.getId(), ApplicationStatus.REJECTED);
        stats.setRejectionsCount(rejections);

        // Follow ups due
        long followUps = applicationRepository.countByWorkspaceIdAndFollowUpAtLessThanEqualAndStatusNotIn(
                workspace.getId(), LocalDate.now(), TERMINAL_STATUSES);
        stats.setFollowUpsDue(followUps);

        // By Status
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : applicationRepository.countByStatusGroupByStatus(workspace.getId())) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                byStatus.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        stats.setByStatus(byStatus);

        // By Source
        Map<String, Long> bySource = new HashMap<>();
        for (Object[] row : applicationRepository.countBySourceGroupBySource(workspace.getId())) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                bySource.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }
        stats.setBySource(bySource);

        return stats;
    }

    private JobApplication findApplicationOwnedByUser(UUID userId, UUID applicationId) {
        return applicationRepository.findByIdAndOwnerId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + applicationId));
    }

    private Workspace resolveWorkspace(UUID userId, UUID workspaceId) {
        if (workspaceId != null) {
            return workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));
        }
        List<Workspace> workspaces = workspaceRepository.findByOwnerIdOrderByCreatedAtAsc(userId);
        if (workspaces.isEmpty()) {
            throw new ResourceNotFoundException("No workspaces found for user: " + userId);
        }
        return workspaces.get(0);
    }
}

