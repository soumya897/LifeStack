package com.lifestack.coding.repository;

import com.lifestack.coding.entity.ProblemSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemSolutionRepository extends JpaRepository<ProblemSolution, UUID> {

    List<ProblemSolution> findByProblemIdOrderByCreatedAtDesc(UUID problemId);

    @Query("SELECT s FROM ProblemSolution s WHERE s.id = :id AND s.problem.topic.roadmap.workspace.owner.id = :ownerId")
    Optional<ProblemSolution> findByIdAndOwnerId(@Param("id") UUID id, @Param("ownerId") UUID ownerId);
}
