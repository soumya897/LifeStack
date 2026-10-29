package com.lifestack.learning.repository;

import com.lifestack.learning.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {

    List<Topic> findByRoadmapIdOrderBySortOrderAsc(UUID roadmapId);

    @Query("SELECT t FROM Topic t WHERE t.id = :id AND t.roadmap.workspace.owner.id = :ownerId")
    Optional<Topic> findByIdAndRoadmapWorkspaceOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    @Query("SELECT t FROM Topic t WHERE t.id = :id AND t.roadmap.id = :roadmapId")
    Optional<Topic> findByIdAndRoadmapId(@Param("id") UUID id, @Param("roadmapId") UUID roadmapId);

    @Query("SELECT COALESCE(MAX(t.sortOrder), -1) FROM Topic t WHERE t.roadmap.id = :roadmapId")
    int findMaxSortOrderByRoadmapId(@Param("roadmapId") UUID roadmapId);
}

