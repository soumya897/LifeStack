package com.lifestack.analytics.service;

import com.lifestack.analytics.dto.InterviewAnalyticsResponse;
import com.lifestack.analytics.dto.JobMonthlyVelocityResponse;
import com.lifestack.analytics.dto.JobSourceAnalyticsResponse;
import com.lifestack.analytics.dto.JobSummaryAnalyticsResponse;
import com.lifestack.analytics.dto.RoadmapAnalyticsResponse;
import com.lifestack.coding.entity.Problem;
import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemStatus;
import com.lifestack.coding.repository.ProblemRepository;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.InterviewEvent;
import com.lifestack.job.entity.InterviewEventType;
import com.lifestack.job.entity.InterviewResult;
import com.lifestack.job.entity.InterviewStatus;
import com.lifestack.job.entity.JobApplication;
import com.lifestack.job.repository.InterviewEventRepository;
import com.lifestack.job.repository.JobApplicationRepository;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.entity.TopicStatus;
import com.lifestack.learning.repository.RoadmapRepository;
import com.lifestack.learning.repository.TopicRepository;
import com.lifestack.learning.service.ProgressCalculationService;
import com.lifestack.note.repository.NoteRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service calculating cross-domain learning and career pipeline analytics.
 */
@Service
public class AnalyticsService {

    private final WorkspaceRepository workspaceRepository;
    private final RoadmapRepository roadmapRepository;
    private final TopicRepository topicRepository;
    private final ProblemRepository problemRepository;
    private final NoteRepository noteRepository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewEventRepository interviewEventRepository;
    private final ProgressCalculationService progressCalculationService;

    private static final Set<ApplicationStatus> TERMINAL_JOB_STATUSES = EnumSet.of(
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.HIRED
    );

    public AnalyticsService(WorkspaceRepository workspaceRepository,
                            RoadmapRepository roadmapRepository,
                            TopicRepository topicRepository,
                            ProblemRepository problemRepository,
                            NoteRepository noteRepository,
                            JobApplicationRepository applicationRepository,
                            InterviewEventRepository interviewEventRepository,
                            ProgressCalculationService progressCalculationService) {
        this.workspaceRepository = workspaceRepository;
        this.roadmapRepository = roadmapRepository;
        this.topicRepository = topicRepository;
        this.problemRepository = problemRepository;
        this.noteRepository = noteRepository;
        this.applicationRepository = applicationRepository;
        this.interviewEventRepository = interviewEventRepository;
        this.progressCalculationService = progressCalculationService;
    }

    private Workspace resolveWorkspace(UUID userId, UUID requestedWorkspaceId) {
        List<Workspace> userWorkspaces = workspaceRepository.findByOwnerIdOrderByCreatedAtAsc(userId);
        if (userWorkspaces.isEmpty()) {
            throw new ResourceNotFoundException("No workspaces found for user");
        }
        if (requestedWorkspaceId != null) {
            return userWorkspaces.stream()
                    .filter(w -> w.getId().equals(requestedWorkspaceId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + requestedWorkspaceId));
        }
        return userWorkspaces.get(0);
    }

    @Transactional(readOnly = true)
    public RoadmapAnalyticsResponse getRoadmapAnalytics(UUID userId, UUID requestedWorkspaceId) {
        Workspace workspace = resolveWorkspace(userId, requestedWorkspaceId);
        UUID workspaceId = workspace.getId();

        RoadmapAnalyticsResponse response = new RoadmapAnalyticsResponse();

        List<Roadmap> roadmaps = roadmapRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        response.setTotalRoadmaps(roadmaps.size());
        response.setActiveRoadmaps((int) roadmaps.stream().filter(r -> r.getStatus() == RoadmapStatus.ACTIVE).count());
        response.setCompletedRoadmaps((int) roadmaps.stream().filter(r -> r.getStatus() == RoadmapStatus.COMPLETED).count());

        List<Topic> topics = topicRepository.findByWorkspaceId(workspaceId);
        response.setTotalTopics(topics.size());
        int completedTopics = (int) topics.stream().filter(t -> t.getStatus() == TopicStatus.COMPLETED).count();
        response.setCompletedTopics(completedTopics);

        double topicPct = topics.isEmpty() ? 0.0 : (completedTopics * 100.0) / topics.size();
        response.setOverallTopicCompletionPercentage(Math.round(topicPct * 10.0) / 10.0);

        List<Problem> problems = problemRepository.findByWorkspaceId(workspaceId);
        response.setTotalProblems(problems.size());
        int solved = (int) problems.stream()
                .filter(p -> p.getStatus() == ProblemStatus.SOLVED || p.getStatus() == ProblemStatus.MASTERED)
                .count();
        response.setSolvedProblems(solved);

        Map<String, Integer> byDifficulty = new HashMap<>();
        for (ProblemDifficulty diff : ProblemDifficulty.values()) {
            byDifficulty.put(diff.name(), (int) problems.stream().filter(p -> p.getDifficulty() == diff).count());
        }
        response.setProblemsByDifficulty(byDifficulty);

        Map<String, Integer> byStatus = new HashMap<>();
        for (ProblemStatus st : ProblemStatus.values()) {
            byStatus.put(st.name(), (int) problems.stream().filter(p -> p.getStatus() == st).count());
        }
        response.setProblemsByStatus(byStatus);

        long noteCount = noteRepository.countByWorkspaceIdAndOwnerId(workspaceId, userId);
        response.setTotalNotes((int) noteCount);

        LocalDate today = LocalDate.now();
        List<RoadmapAnalyticsResponse.RoadmapProgressItem> progressItems = new ArrayList<>();
        for (Roadmap r : roadmaps) {
            List<Topic> rTopics = topics.stream()
                    .filter(t -> t.getRoadmap().getId().equals(r.getId()))
                    .collect(Collectors.toList());
            int rCompleted = (int) rTopics.stream().filter(t -> t.getStatus() == TopicStatus.COMPLETED).count();
            boolean overdue = r.getTargetDate() != null
                    && r.getTargetDate().isBefore(today)
                    && r.getStatus() != RoadmapStatus.COMPLETED;

            double calculatedProgress = progressCalculationService.calculateProgress(r, rTopics);

            progressItems.add(new RoadmapAnalyticsResponse.RoadmapProgressItem(
                    r.getId(),
                    r.getName(),
                    r.getStatus().name(),
                    calculatedProgress,
                    rTopics.size(),
                    rCompleted,
                    r.getTargetDate(),
                    overdue
            ));
        }
        response.setRoadmaps(progressItems);

        return response;
    }

    @Transactional(readOnly = true)
    public JobSummaryAnalyticsResponse getJobSummary(UUID userId, UUID requestedWorkspaceId) {
        Workspace workspace = resolveWorkspace(userId, requestedWorkspaceId);
        UUID workspaceId = workspace.getId();

        JobSummaryAnalyticsResponse response = new JobSummaryAnalyticsResponse();
        List<JobApplication> apps = applicationRepository.findByWorkspaceId(workspaceId);
        response.setTotalApplications(apps.size());

        YearMonth currentMonth = YearMonth.now();
        int appliedThisMonth = (int) apps.stream()
                .filter(a -> a.getAppliedAt() != null
                        && YearMonth.from(a.getAppliedAt()).equals(currentMonth))
                .count();
        response.setAppliedThisMonth(appliedThisMonth);

        long activeInterviews = interviewEventRepository.countByApplicationWorkspaceIdAndScheduledAtGreaterThanEqualAndStatus(
                workspaceId, Instant.now(), InterviewStatus.SCHEDULED);
        response.setActiveInterviews((int) activeInterviews);

        int offers = (int) apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.OFFER || a.getStatus() == ApplicationStatus.HIRED)
                .count();
        response.setOffersCount(offers);

        int hired = (int) apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                .count();
        response.setHiredCount(hired);

        int rejections = (int) apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.REJECTED)
                .count();
        response.setRejectionsCount(rejections);

        long followUpsDue = applicationRepository.countByWorkspaceIdAndFollowUpAtLessThanEqualAndStatusNotIn(
                workspaceId, LocalDate.now(), TERMINAL_JOB_STATUSES);
        response.setFollowUpsDue((int) followUpsDue);

        double offerRate = apps.isEmpty() ? 0.0 : (offers * 100.0) / apps.size();
        response.setOfferRatePercentage(Math.round(offerRate * 10.0) / 10.0);

        Map<String, Integer> byStatus = new HashMap<>();
        for (ApplicationStatus st : ApplicationStatus.values()) {
            byStatus.put(st.name(), (int) apps.stream().filter(a -> a.getStatus() == st).count());
        }
        response.setByStatus(byStatus);

        Map<String, Integer> bySource = new HashMap<>();
        for (JobApplication a : apps) {
            String src = (a.getSource() == null || a.getSource().isBlank()) ? "Direct / Other" : a.getSource().trim();
            bySource.put(src, bySource.getOrDefault(src, 0) + 1);
        }
        response.setBySource(bySource);

        // Calculate stage funnel progression
        int appliedOrBeyond = (int) apps.stream().filter(a -> a.getStatus() != ApplicationStatus.SAVED).count();
        int assessmentOrBeyond = (int) apps.stream().filter(a ->
                a.getStatus() == ApplicationStatus.ASSESSMENT ||
                a.getStatus() == ApplicationStatus.INTERVIEW ||
                a.getStatus() == ApplicationStatus.OFFER ||
                a.getStatus() == ApplicationStatus.HIRED).count();
        int interviewOrBeyond = (int) apps.stream().filter(a ->
                a.getStatus() == ApplicationStatus.INTERVIEW ||
                a.getStatus() == ApplicationStatus.OFFER ||
                a.getStatus() == ApplicationStatus.HIRED).count();

        List<JobSummaryAnalyticsResponse.FunnelStageItem> funnel = new ArrayList<>();
        double base = apps.isEmpty() ? 1.0 : apps.size();
        funnel.add(new JobSummaryAnalyticsResponse.FunnelStageItem("SAVED", apps.size(), 100.0));
        funnel.add(new JobSummaryAnalyticsResponse.FunnelStageItem("APPLIED", appliedOrBeyond,
                Math.round((appliedOrBeyond * 100.0) / base * 10.0) / 10.0));
        funnel.add(new JobSummaryAnalyticsResponse.FunnelStageItem("ASSESSMENT", assessmentOrBeyond,
                Math.round((assessmentOrBeyond * 100.0) / base * 10.0) / 10.0));
        funnel.add(new JobSummaryAnalyticsResponse.FunnelStageItem("INTERVIEW", interviewOrBeyond,
                Math.round((interviewOrBeyond * 100.0) / base * 10.0) / 10.0));
        funnel.add(new JobSummaryAnalyticsResponse.FunnelStageItem("OFFER", offers,
                Math.round((offers * 100.0) / base * 10.0) / 10.0));
        funnel.add(new JobSummaryAnalyticsResponse.FunnelStageItem("HIRED", hired,
                Math.round((hired * 100.0) / base * 10.0) / 10.0));
        response.setStageFunnel(funnel);

        return response;
    }

    @Transactional(readOnly = true)
    public JobMonthlyVelocityResponse getMonthlyVelocity(UUID userId, UUID requestedWorkspaceId) {
        Workspace workspace = resolveWorkspace(userId, requestedWorkspaceId);
        UUID workspaceId = workspace.getId();

        List<JobApplication> apps = applicationRepository.findByWorkspaceId(workspaceId);
        List<InterviewEvent> interviews = interviewEventRepository.findByApplicationWorkspaceId(workspaceId);

        // Generate past 6 months
        YearMonth now = YearMonth.now();
        List<JobMonthlyVelocityResponse.MonthlyVelocityItem> items = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = now.minusMonths(i);
            String ymStr = targetMonth.toString();

            int submitted = (int) apps.stream()
                    .filter(a -> a.getAppliedAt() != null && YearMonth.from(a.getAppliedAt()).equals(targetMonth))
                    .count();

            int interviewsInMonth = (int) interviews.stream()
                    .filter(iv -> {
                        Instant time = iv.getOccurredAt() != null ? iv.getOccurredAt() : iv.getScheduledAt();
                        if (time == null) return false;
                        LocalDate dt = time.atZone(ZoneOffset.UTC).toLocalDate();
                        return YearMonth.from(dt).equals(targetMonth);
                    })
                    .count();

            int offersInMonth = (int) apps.stream()
                    .filter(a -> (a.getStatus() == ApplicationStatus.OFFER || a.getStatus() == ApplicationStatus.HIRED)
                            && a.getAppliedAt() != null && YearMonth.from(a.getAppliedAt()).equals(targetMonth))
                    .count();

            int rejectionsInMonth = (int) apps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.REJECTED
                            && a.getAppliedAt() != null && YearMonth.from(a.getAppliedAt()).equals(targetMonth))
                    .count();

            items.add(new JobMonthlyVelocityResponse.MonthlyVelocityItem(
                    ymStr,
                    submitted,
                    interviewsInMonth,
                    offersInMonth,
                    rejectionsInMonth
            ));
        }

        return new JobMonthlyVelocityResponse(items);
    }

    @Transactional(readOnly = true)
    public JobSourceAnalyticsResponse getSourceAnalytics(UUID userId, UUID requestedWorkspaceId) {
        Workspace workspace = resolveWorkspace(userId, requestedWorkspaceId);
        UUID workspaceId = workspace.getId();

        List<JobApplication> apps = applicationRepository.findByWorkspaceId(workspaceId);

        Map<String, List<JobApplication>> groupedBySource = apps.stream()
                .collect(Collectors.groupingBy(a ->
                        (a.getSource() == null || a.getSource().isBlank()) ? "Direct / Other" : a.getSource().trim(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<JobSourceAnalyticsResponse.SourcePerformanceItem> items = new ArrayList<>();
        for (Map.Entry<String, List<JobApplication>> entry : groupedBySource.entrySet()) {
            String sourceName = entry.getKey();
            List<JobApplication> sourceApps = entry.getValue();
            int total = sourceApps.size();

            int interviewCount = (int) sourceApps.stream().filter(a ->
                    a.getStatus() == ApplicationStatus.INTERVIEW ||
                    a.getStatus() == ApplicationStatus.OFFER ||
                    a.getStatus() == ApplicationStatus.HIRED ||
                    (a.getInterviews() != null && !a.getInterviews().isEmpty())
            ).count();

            int offerCount = (int) sourceApps.stream().filter(a ->
                    a.getStatus() == ApplicationStatus.OFFER || a.getStatus() == ApplicationStatus.HIRED
            ).count();

            double ivRate = total > 0 ? (interviewCount * 100.0) / total : 0.0;
            double offRate = total > 0 ? (offerCount * 100.0) / total : 0.0;

            items.add(new JobSourceAnalyticsResponse.SourcePerformanceItem(
                    sourceName,
                    total,
                    interviewCount,
                    offerCount,
                    Math.round(ivRate * 10.0) / 10.0,
                    Math.round(offRate * 10.0) / 10.0
            ));
        }

        items.sort((a, b) -> Integer.compare(b.getTotalApplications(), a.getTotalApplications()));
        return new JobSourceAnalyticsResponse(items);
    }

    @Transactional(readOnly = true)
    public InterviewAnalyticsResponse getInterviewAnalytics(UUID userId, UUID requestedWorkspaceId) {
        Workspace workspace = resolveWorkspace(userId, requestedWorkspaceId);
        UUID workspaceId = workspace.getId();

        List<InterviewEvent> interviews = interviewEventRepository.findByApplicationWorkspaceId(workspaceId);

        InterviewAnalyticsResponse response = new InterviewAnalyticsResponse();
        response.setTotalInterviews(interviews.size());

        Instant now = Instant.now();
        int upcoming = (int) interviews.stream()
                .filter(i -> i.getStatus() == InterviewStatus.SCHEDULED
                        && i.getScheduledAt() != null
                        && i.getScheduledAt().isAfter(now))
                .count();
        response.setUpcomingInterviews(upcoming);

        int completed = (int) interviews.stream()
                .filter(i -> i.getStatus() == InterviewStatus.COMPLETED)
                .count();
        response.setCompletedInterviews(completed);

        Map<String, Integer> byRound = new HashMap<>();
        for (InterviewEventType type : InterviewEventType.values()) {
            byRound.put(type.name(), (int) interviews.stream().filter(i -> i.getEventType() == type).count());
        }
        response.setByRoundType(byRound);

        Map<String, Integer> byStatus = new HashMap<>();
        for (InterviewStatus st : InterviewStatus.values()) {
            byStatus.put(st.name(), (int) interviews.stream().filter(i -> i.getStatus() == st).count());
        }
        response.setByStatus(byStatus);

        Map<String, Integer> byResult = new HashMap<>();
        for (InterviewResult res : InterviewResult.values()) {
            byResult.put(res.name(), (int) interviews.stream().filter(i -> i.getResult() == res).count());
        }
        response.setByResult(byResult);

        return response;
    }
}
