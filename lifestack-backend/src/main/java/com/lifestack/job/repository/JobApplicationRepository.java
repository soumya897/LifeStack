package com.lifestack.job.repository;

import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    Optional<JobApplication> findByIdAndOwnerId(UUID id, UUID ownerId);

    Page<JobApplication> findByWorkspaceId(UUID workspaceId, Pageable pageable);

    Page<JobApplication> findByWorkspaceIdAndStatus(UUID workspaceId, ApplicationStatus status, Pageable pageable);

    Page<JobApplication> findByWorkspaceIdAndSource(UUID workspaceId, String source, Pageable pageable);

    Page<JobApplication> findByWorkspaceIdAndStatusAndSource(UUID workspaceId, ApplicationStatus status, String source, Pageable pageable);

    @Query("SELECT a FROM JobApplication a WHERE a.workspace.id = :workspaceId AND " +
           "(LOWER(a.companyName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.jobTitle) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.source) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.location) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<JobApplication> searchApplications(@Param("workspaceId") UUID workspaceId, @Param("q") String q, Pageable pageable);

    long countByWorkspaceId(UUID workspaceId);

    long countByWorkspaceIdAndStatus(UUID workspaceId, ApplicationStatus status);

    long countByWorkspaceIdAndAppliedAtBetween(UUID workspaceId, LocalDate startDate, LocalDate endDate);

    long countByWorkspaceIdAndFollowUpAtLessThanEqualAndStatusNotIn(
            UUID workspaceId, LocalDate date, Collection<ApplicationStatus> terminalStatuses);

    List<JobApplication> findByWorkspaceId(UUID workspaceId);

    List<JobApplication> findByWorkspaceIdOrderByAppliedAtAsc(UUID workspaceId);

    @Query("SELECT a.source, COUNT(a) FROM JobApplication a WHERE a.workspace.id = :workspaceId GROUP BY a.source")
    List<Object[]> countBySourceGroupBySource(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT a.status, COUNT(a) FROM JobApplication a WHERE a.workspace.id = :workspaceId GROUP BY a.status")
    List<Object[]> countByStatusGroupByStatus(@Param("workspaceId") UUID workspaceId);

    List<JobApplication> findTop5ByWorkspaceIdOrderByUpdatedAtDesc(UUID workspaceId);
}

