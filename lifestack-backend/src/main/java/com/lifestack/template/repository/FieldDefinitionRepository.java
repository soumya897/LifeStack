package com.lifestack.template.repository;

import com.lifestack.template.entity.FieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldDefinitionRepository extends JpaRepository<FieldDefinition, UUID> {

    List<FieldDefinition> findByVersionIdOrderBySortOrderAscCreatedAtAsc(UUID versionId);

    Optional<FieldDefinition> findByVersionIdAndFieldKey(UUID versionId, String fieldKey);
}
