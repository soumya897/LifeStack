package com.lifestack.learning.repository;

import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {

    List<Roadmap> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);

    List<Roadmap> findByWorkspaceIdAndStatusOrderByCreatedAtDesc(UUID workspaceId, RoadmapStatus status);

    @Query("SELECT r FROM Roadmap r WHERE r.id = :id AND r.workspace.owner.id = :ownerId")
    Optional<Roadmap> findByIdAndWorkspaceOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    @Query("SELECT r FROM Roadmap r LEFT JOIN FETCH r.topics WHERE r.id = :id AND r.workspace.owner.id = :ownerId")
    Optional<Roadmap> findWithTopicsByIdAndWorkspaceOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    long countByWorkspaceIdAndStatus(UUID workspaceId, RoadmapStatus status);

    List<Roadmap> findTop5ByWorkspaceIdAndStatusOrderByUpdatedAtDesc(UUID workspaceId, RoadmapStatus status);
}

