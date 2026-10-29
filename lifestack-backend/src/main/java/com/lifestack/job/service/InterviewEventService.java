package com.lifestack.job.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.job.dto.CreateInterviewRequest;
import com.lifestack.job.dto.InterviewResponse;
import com.lifestack.job.dto.UpdateInterviewRequest;
import com.lifestack.job.entity.*;
import com.lifestack.job.repository.ApplicationHistoryRepository;
import com.lifestack.job.repository.InterviewEventRepository;
import com.lifestack.job.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InterviewEventService {

    private final InterviewEventRepository interviewEventRepository;
    private final JobApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository historyRepository;

    public InterviewEventService(InterviewEventRepository interviewEventRepository,
                                 JobApplicationRepository applicationRepository,
                                 ApplicationHistoryRepository historyRepository) {
        this.interviewEventRepository = interviewEventRepository;
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsForApplication(UUID userId, UUID applicationId) {
        JobApplication app = applicationRepository.findByIdAndOwnerId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + applicationId));
        return interviewEventRepository.findByApplicationIdOrderByScheduledAtAsc(app.getId()).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewResponse createInterview(UUID userId, UUID applicationId, CreateInterviewRequest request) {
        JobApplication app = applicationRepository.findByIdAndOwnerId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + applicationId));

        InterviewEvent event = new InterviewEvent(
                app,
                request.getRoundName().trim(),
                request.getEventType(),
                request.getScheduledAt(),
                request.getOccurredAt(),
                request.getStatus(),
                request.getResult(),
                request.getNotes()
        );

        InterviewEvent saved = interviewEventRepository.save(event);

        // Auto-progress application status if in early stage
        if (app.getStatus() == ApplicationStatus.SAVED || app.getStatus() == ApplicationStatus.APPLIED || app.getStatus() == ApplicationStatus.SCREENING) {
            ApplicationStatus targetStatus = request.getEventType() == InterviewEventType.TAKE_HOME_ASSESSMENT
                    ? ApplicationStatus.ASSESSMENT
                    : ApplicationStatus.INTERVIEW;

            ApplicationStatus oldStatus = app.getStatus();
            app.setStatus(targetStatus);
            applicationRepository.save(app);

            ApplicationHistory history = new ApplicationHistory(
                    app,
                    oldStatus,
                    targetStatus,
                    "Automatically progressed to " + targetStatus + " upon scheduling round '" + saved.getRoundName() + "'"
            );
            historyRepository.save(history);
        }

        return InterviewResponse.fromEntity(saved);
    }

    @Transactional
    public InterviewResponse updateInterview(UUID userId, UUID interviewId, UpdateInterviewRequest request) {
        InterviewEvent event = interviewEventRepository.findByIdAndOwnerId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview event not found: " + interviewId));

        if (request.getRoundName() != null && !request.getRoundName().isBlank()) {
            event.setRoundName(request.getRoundName().trim());
        }
        if (request.getEventType() != null) {
            event.setEventType(request.getEventType());
        }
        if (request.getScheduledAt() != null) {
            event.setScheduledAt(request.getScheduledAt());
        }
        if (request.getOccurredAt() != null) {
            event.setOccurredAt(request.getOccurredAt());
        }
        if (request.getStatus() != null) {
            event.setStatus(request.getStatus());
        }
        if (request.getResult() != null) {
            event.setResult(request.getResult());
            // If result is OFFER, we can optionally note it or user can progress stage
            if (request.getResult() == InterviewResult.OFFER && event.getApplication().getStatus() != ApplicationStatus.OFFER) {
                JobApplication app = event.getApplication();
                ApplicationStatus oldStatus = app.getStatus();
                app.setStatus(ApplicationStatus.OFFER);
                applicationRepository.save(app);

                ApplicationHistory history = new ApplicationHistory(
                        app,
                        oldStatus,
                        ApplicationStatus.OFFER,
                        "Offer received following round '" + event.getRoundName() + "'"
                );
                historyRepository.save(history);
            }
        }
        if (request.getNotes() != null) {
            event.setNotes(request.getNotes());
        }

        InterviewEvent updated = interviewEventRepository.save(event);
        return InterviewResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteInterview(UUID userId, UUID interviewId) {
        InterviewEvent event = interviewEventRepository.findByIdAndOwnerId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview event not found: " + interviewId));
        interviewEventRepository.delete(event);
    }
}

