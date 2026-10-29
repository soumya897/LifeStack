package com.lifestack.learning.service;

import com.lifestack.learning.entity.ProgressMode;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.entity.TopicStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Single backend calculation service as the source of truth for learning progress
 * and timeline metrics.
 */
@Service
public class ProgressCalculationService {

    /**
     * Calculates the overall progress percentage (0.0 to 100.0) for a roadmap based on its configured ProgressMode.
     * Prevents division by zero: an empty roadmap evaluates to 0.0 rather than a misleading 100%.
     */
    public double calculateProgress(Roadmap roadmap, List<Topic> topics) {
        if (roadmap == null || topics == null || topics.isEmpty()) {
            return 0.0;
        }

        ProgressMode mode = roadmap.getProgressMode() != null ? roadmap.getProgressMode() : ProgressMode.TOPIC;

        return switch (mode) {
            case TOPIC -> calculateTopicBasedProgress(topics);
            case WEIGHTED -> calculateWeightedProgress(topics);
            case TASK -> calculateTopicBasedProgress(topics); // Fallback to topic completion until tasks attached
        };
    }

    /**
     * Topic-based formula: (completed topics / total topics) * 100
     */
    public double calculateTopicBasedProgress(List<Topic> topics) {
        if (topics == null || topics.isEmpty()) {
            return 0.0;
        }

        long total = topics.size();
        long completed = topics.stream()
                .filter(t -> t.getStatus() == TopicStatus.COMPLETED)
                .count();

        if (total == 0) {
            return 0.0;
        }

        double percentage = ((double) completed / (double) total) * 100.0;
        return roundToOneDecimalPlace(percentage);
    }

    /**
     * Weighted formula: (sum of completed item weights / sum of all item weights) * 100
     * Weights must be positive integers (>= 1).
     */
    public double calculateWeightedProgress(List<Topic> topics) {
        if (topics == null || topics.isEmpty()) {
            return 0.0;
        }

        int totalWeight = 0;
        int completedWeight = 0;

        for (Topic topic : topics) {
            int weight = Math.max(1, topic.getWeight());
            totalWeight += weight;
            if (topic.getStatus() == TopicStatus.COMPLETED) {
                completedWeight += weight;
            }
        }

        if (totalWeight <= 0) {
            return 0.0;
        }

        double percentage = ((double) completedWeight / (double) totalWeight) * 100.0;
        return roundToOneDecimalPlace(percentage);
    }

    /**
     * Task-based formula: (completed tasks / total tasks) * 100
     */
    public double calculateTaskBasedProgress(long completedTasks, long totalTasks) {
        if (totalTasks <= 0) {
            return 0.0;
        }
        double percentage = ((double) completedTasks / (double) totalTasks) * 100.0;
        return roundToOneDecimalPlace(percentage);
    }

    /**
     * Calculates days remaining until target deadline.
     * Returns positive number if due in future, 0 if due today, negative if overdue.
     */
    public Long calculateDaysRemaining(LocalDate targetDate) {
        if (targetDate == null) {
            return null;
        }
        return ChronoUnit.DAYS.between(LocalDate.now(), targetDate);
    }

    /**
     * Determines whether a target date is overdue.
     */
    public boolean isRoadmapOverdue(LocalDate targetDate, RoadmapStatus status) {
        if (targetDate == null || status == RoadmapStatus.COMPLETED) {
            return false;
        }
        return LocalDate.now().isAfter(targetDate);
    }

    /**
     * Determines whether a topic target date is overdue.
     */
    public boolean isTopicOverdue(LocalDate targetDate, TopicStatus status) {
        if (targetDate == null || status == TopicStatus.COMPLETED) {
            return false;
        }
        return LocalDate.now().isAfter(targetDate);
    }

    /**
     * Calculates elapsed days since creation date in UTC.
     */
    public long calculateElapsedDays(Instant createdAt) {
        if (createdAt == null) {
            return 0L;
        }
        LocalDate createdDate = createdAt.atZone(ZoneOffset.UTC).toLocalDate();
        return Math.max(0, ChronoUnit.DAYS.between(createdDate, LocalDate.now()));
    }

    private double roundToOneDecimalPlace(double value) {
        double clamped = Math.max(0.0, Math.min(100.0, value));
        return Math.round(clamped * 10.0) / 10.0;
    }
}
