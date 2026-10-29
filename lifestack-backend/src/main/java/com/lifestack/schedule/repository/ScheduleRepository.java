package com.lifestack.schedule.repository;

import com.lifestack.schedule.entity.ScheduleItem;
import com.lifestack.schedule.entity.ScheduleItemType;
import com.lifestack.schedule.entity.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleItem, UUID> {

    @Query("SELECT s FROM ScheduleItem s JOIN FETCH s.workspace JOIN FETCH s.owner WHERE s.workspace.id = :workspaceId AND s.owner.id = :ownerId ORDER BY s.scheduledAt ASC")
    List<ScheduleItem> findByWorkspaceIdAndOwnerIdOrderByScheduledAtAsc(@Param("workspaceId") UUID workspaceId,
                                                                       @Param("ownerId") UUID ownerId);

    @Query("SELECT s FROM ScheduleItem s JOIN FETCH s.workspace JOIN FETCH s.owner WHERE s.workspace.id = :workspaceId AND s.owner.id = :ownerId AND s.status = :status ORDER BY s.scheduledAt ASC")
    List<ScheduleItem> findByWorkspaceIdAndOwnerIdAndStatusOrderByScheduledAtAsc(@Param("workspaceId") UUID workspaceId,
                                                                                @Param("ownerId") UUID ownerId,
                                                                                @Param("status") ScheduleStatus status);

    @Query("SELECT s FROM ScheduleItem s JOIN FETCH s.workspace JOIN FETCH s.owner WHERE s.workspace.id = :workspaceId AND s.owner.id = :ownerId AND s.itemType = :itemType ORDER BY s.scheduledAt ASC")
    List<ScheduleItem> findByWorkspaceIdAndOwnerIdAndItemTypeOrderByScheduledAtAsc(@Param("workspaceId") UUID workspaceId,
                                                                                  @Param("ownerId") UUID ownerId,
                                                                                  @Param("itemType") ScheduleItemType itemType);

    @Query("SELECT s FROM ScheduleItem s JOIN FETCH s.workspace JOIN FETCH s.owner WHERE s.workspace.id = :workspaceId AND s.owner.id = :ownerId AND s.status = :status AND s.itemType = :itemType ORDER BY s.scheduledAt ASC")
    List<ScheduleItem> findByWorkspaceIdAndOwnerIdAndStatusAndItemTypeOrderByScheduledAtAsc(@Param("workspaceId") UUID workspaceId,
                                                                                           @Param("ownerId") UUID ownerId,
                                                                                           @Param("status") ScheduleStatus status,
                                                                                           @Param("itemType") ScheduleItemType itemType);

    @Query("SELECT s FROM ScheduleItem s JOIN FETCH s.workspace JOIN FETCH s.owner WHERE s.id = :id AND s.owner.id = :ownerId")
    Optional<ScheduleItem> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    long countByWorkspaceIdAndStatus(UUID workspaceId, ScheduleStatus status);

    long countByWorkspaceIdAndStatusAndScheduledAtBetween(UUID workspaceId, ScheduleStatus status, Instant start, Instant end);

    long countByWorkspaceIdAndStatusAndScheduledAtLessThan(UUID workspaceId, ScheduleStatus status, Instant instant);
}

