package com.lifestack.customrecord.repository;

import com.lifestack.customrecord.entity.CustomRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomRecordRepository extends JpaRepository<CustomRecord, UUID> {

    List<CustomRecord> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);

    List<CustomRecord> findByTemplateVersionTemplateIdOrderByCreatedAtDesc(UUID templateId);

    Optional<CustomRecord> findByIdAndOwnerId(UUID id, UUID ownerId);
}

