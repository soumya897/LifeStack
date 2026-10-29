package com.lifestack.customrecord.repository;

import com.lifestack.customrecord.entity.FieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldValueRepository extends JpaRepository<FieldValue, UUID> {

    List<FieldValue> findByRecordId(UUID recordId);

    Optional<FieldValue> findByRecordIdAndFieldDefinitionId(UUID recordId, UUID fieldDefinitionId);
}

