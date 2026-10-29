package com.lifestack.job.repository;

import com.lifestack.job.entity.InterviewEvent;
import com.lifestack.job.entity.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewEventRepository extends JpaRepository<InterviewEvent, UUID> {

    List<InterviewEvent> findByApplicationIdOrderByScheduledAtAsc(UUID applicationId);

    @Query("SELECT i FROM InterviewEvent i WHERE i.id = :id AND i.application.owner.id = :ownerId")
    Optional<InterviewEvent> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    long countByApplicationWorkspaceIdAndScheduledAtGreaterThanEqualAndStatus(
            UUID workspaceId, Instant from, InterviewStatus status);

    @Query("SELECT i.eventType, COUNT(i) FROM InterviewEvent i WHERE i.application.workspace.id = :workspaceId GROUP BY i.eventType")
    List<Object[]> countByEventTypeGroup(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT i.result, COUNT(i) FROM InterviewEvent i WHERE i.application.workspace.id = :workspaceId GROUP BY i.result")
    List<Object[]> countByResultGroup(@Param("workspaceId") UUID workspaceId);
}

