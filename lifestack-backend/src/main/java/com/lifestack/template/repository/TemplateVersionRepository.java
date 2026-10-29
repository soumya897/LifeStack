package com.lifestack.template.repository;

import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.template.entity.TemplateVersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TemplateVersionRepository extends JpaRepository<TemplateVersion, UUID> {

    List<TemplateVersion> findByTemplateIdOrderByVersionNumberDesc(UUID templateId);

    Optional<TemplateVersion> findByTemplateIdAndVersionNumber(UUID templateId, int versionNumber);

    Optional<TemplateVersion> findFirstByTemplateIdAndStatusOrderByVersionNumberDesc(UUID templateId, TemplateVersionStatus status);
}
