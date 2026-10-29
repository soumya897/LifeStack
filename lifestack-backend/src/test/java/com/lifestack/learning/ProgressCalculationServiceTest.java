package com.lifestack.learning;

import com.lifestack.learning.entity.ProgressMode;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.entity.TopicStatus;
import com.lifestack.learning.service.ProgressCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProgressCalculationServiceTest {

    private ProgressCalculationService progressService;

    @BeforeEach
    void setUp() {
        progressService = new ProgressCalculationService();
    }

    @Test
    @DisplayName("Topic-based progress: Empty topics list returns 0.0% instead of dividing by zero")
    void testTopicProgressEmpty() {
        Roadmap roadmap = new Roadmap();
        roadmap.setProgressMode(ProgressMode.TOPIC);

        assertEquals(0.0, progressService.calculateProgress(roadmap, Collections.emptyList()));
        assertEquals(0.0, progressService.calculateProgress(roadmap, null));
    }

    @Test
    @DisplayName("Topic-based progress: Computes correct percentage rounded to one decimal")
    void testTopicProgressCalculations() {
        Roadmap roadmap = new Roadmap();
        roadmap.setProgressMode(ProgressMode.TOPIC);

        List<Topic> topics = new ArrayList<>();
        Topic t1 = new Topic();
        t1.setStatus(TopicStatus.COMPLETED);
        Topic t2 = new Topic();
        t2.setStatus(TopicStatus.IN_PROGRESS);
        Topic t3 = new Topic();
        t3.setStatus(TopicStatus.NOT_STARTED);

        topics.add(t1);
        topics.add(t2);
        topics.add(t3);

        // 1 of 3 = 33.3%
        assertEquals(33.3, progressService.calculateProgress(roadmap, topics));

        // Mark t2 completed -> 2 of 3 = 66.7%
        t2.setStatus(TopicStatus.COMPLETED);
        assertEquals(66.7, progressService.calculateProgress(roadmap, topics));

        // Mark t3 completed -> 3 of 3 = 100.0%
        t3.setStatus(TopicStatus.COMPLETED);
        assertEquals(100.0, progressService.calculateProgress(roadmap, topics));
    }

    @Test
    @DisplayName("Weighted progress: Weights are aggregated and completed proportions calculated accurately")
    void testWeightedProgress() {
        Roadmap roadmap = new Roadmap();
        roadmap.setProgressMode(ProgressMode.WEIGHTED);

        List<Topic> topics = new ArrayList<>();
        Topic t1 = new Topic();
        t1.setWeight(1);
        t1.setStatus(TopicStatus.COMPLETED);

        Topic t2 = new Topic();
        t2.setWeight(3);
        t2.setStatus(TopicStatus.NOT_STARTED);

        topics.add(t1);
        topics.add(t2);

        // (1 / 4) * 100 = 25.0%
        assertEquals(25.0, progressService.calculateProgress(roadmap, topics));

        // Mark t2 completed -> (4 / 4) * 100 = 100.0%
        t2.setStatus(TopicStatus.COMPLETED);
        assertEquals(100.0, progressService.calculateProgress(roadmap, topics));
    }

    @Test
    @DisplayName("Deadlines and overdue state: Correctly detects days remaining and overdue status")
    void testDeadlinesAndOverdue() {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(7);
        LocalDate pastDate = today.minusDays(3);

        assertEquals(7L, progressService.calculateDaysRemaining(futureDate));
        assertEquals(-3L, progressService.calculateDaysRemaining(pastDate));
        assertNull(progressService.calculateDaysRemaining(null));

        // Overdue detection
        assertTrue(progressService.isRoadmapOverdue(pastDate, RoadmapStatus.ACTIVE));
        assertFalse(progressService.isRoadmapOverdue(pastDate, RoadmapStatus.COMPLETED));
        assertFalse(progressService.isRoadmapOverdue(futureDate, RoadmapStatus.ACTIVE));

        // Elapsed days
        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        assertTrue(progressService.calculateElapsedDays(weekAgo) >= 6);
    }
}
