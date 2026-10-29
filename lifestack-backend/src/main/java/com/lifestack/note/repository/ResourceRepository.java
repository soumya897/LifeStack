package com.lifestack.note.repository;

import com.lifestack.note.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query("SELECT r FROM Resource r WHERE r.workspace.id = :workspaceId AND r.owner.id = :ownerId ORDER BY r.createdAt DESC")
    List<Resource> findByWorkspaceIdAndOwnerId(@Param("workspaceId") UUID workspaceId, @Param("ownerId") UUID ownerId);

    @Query("SELECT r FROM Resource r WHERE r.id = :id AND r.owner.id = :ownerId")
    Optional<Resource> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    @Query("SELECT r FROM Resource r JOIN r.topics t WHERE t.id = :topicId ORDER BY r.createdAt DESC")
    List<Resource> findResourcesByTopicId(@Param("topicId") UUID topicId);
}
