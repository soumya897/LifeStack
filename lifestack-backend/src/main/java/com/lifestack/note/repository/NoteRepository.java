package com.lifestack.note.repository;

import com.lifestack.note.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {

    @Query("SELECT n FROM Note n WHERE n.workspace.id = :workspaceId AND n.owner.id = :ownerId ORDER BY n.updatedAt DESC")
    List<Note> findByWorkspaceIdAndOwnerId(@Param("workspaceId") UUID workspaceId, @Param("ownerId") UUID ownerId);

    @Query("SELECT n FROM Note n WHERE n.id = :id AND n.owner.id = :ownerId")
    Optional<Note> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);

    @Query("SELECT n FROM Note n WHERE n.workspace.id = :workspaceId AND n.owner.id = :ownerId AND " +
           "(:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(n.tags) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY n.updatedAt DESC")
    List<Note> searchNotes(@Param("workspaceId") UUID workspaceId,
                           @Param("ownerId") UUID ownerId,
                           @Param("search") String search);

    @Query("SELECT n FROM Note n JOIN n.topics t WHERE t.id = :topicId ORDER BY n.createdAt DESC")
    List<Note> findNotesByTopicId(@Param("topicId") UUID topicId);

    @Query("SELECT n FROM Note n JOIN n.problems p WHERE p.id = :problemId ORDER BY n.createdAt DESC")
    List<Note> findNotesByProblemId(@Param("problemId") UUID problemId);
}
