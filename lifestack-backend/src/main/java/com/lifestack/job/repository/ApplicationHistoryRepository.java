package com.lifestack.job.repository;

import com.lifestack.job.entity.ApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationHistoryRepository extends JpaRepository<ApplicationHistory, UUID> {

    List<ApplicationHistory> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}

