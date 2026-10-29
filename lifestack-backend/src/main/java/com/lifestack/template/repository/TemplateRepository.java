package com.lifestack.template.repository;

import com.lifestack.template.entity.Template;
import com.lifestack.template.entity.TemplateRecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TemplateRepository extends JpaRepository<Template, UUID> {

    List<Template> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);

    List<Template> findByWorkspaceIdAndRecordTypeOrderByCreatedAtDesc(UUID workspaceId, TemplateRecordType recordType);

    Optional<Template> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<Template> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
