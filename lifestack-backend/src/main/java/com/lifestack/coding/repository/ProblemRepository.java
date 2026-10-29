package com.lifestack.coding.repository;

import com.lifestack.coding.entity.Problem;
import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, UUID> {

    List<Problem> findByTopicIdOrderByCreatedAtDesc(UUID topicId);

    @Query("SELECT p FROM Problem p WHERE p.topic.roadmap.workspace.id = :workspaceId ORDER BY p.createdAt DESC")
    List<Problem> findByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT p FROM Problem p WHERE p.id = :id AND p.topic.roadmap.workspace.owner.id = :ownerId")
    Optional<Problem> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    @Query("SELECT p FROM Problem p WHERE p.topic.roadmap.workspace.id = :workspaceId AND (:status IS NULL OR p.status = :status) AND (:difficulty IS NULL OR p.difficulty = :difficulty) ORDER BY p.createdAt DESC")
    List<Problem> findByWorkspaceIdAndFilters(@Param("workspaceId") UUID workspaceId,
                                             @Param("status") ProblemStatus status,
                                             @Param("difficulty") ProblemDifficulty difficulty);

    long countByTopicId(UUID topicId);

    long countByTopicIdAndStatus(UUID topicId, ProblemStatus status);
}
