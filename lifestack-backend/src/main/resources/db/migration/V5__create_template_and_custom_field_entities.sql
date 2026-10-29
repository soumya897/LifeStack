-- ==============================================================================
-- LifeStack — Milestone 7: Custom Templates & Application Custom Fields Schema Migration
-- Creates templates, template_versions, field_definitions, custom_records, field_values,
-- and enhances applications with template_version_id and custom_fields JSONB.
-- ==============================================================================

-- 1. Table: templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    record_type VARCHAR(50) NOT NULL DEFAULT 'JOB_APPLICATION',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_workspace_id ON templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_templates_owner_id ON templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_templates_record_type ON templates(record_type);

-- 2. Table: template_versions
CREATE TABLE IF NOT EXISTS template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_template_version UNIQUE (template_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_status ON template_versions(status);

-- 3. Table: field_definitions
CREATE TABLE IF NOT EXISTS field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES template_versions(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_field_version_key UNIQUE (version_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_field_definitions_version_id ON field_definitions(version_id);
CREATE INDEX IF NOT EXISTS idx_field_definitions_sort_order ON field_definitions(version_id, sort_order);

-- 4. Table: custom_records
CREATE TABLE IF NOT EXISTS custom_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_version_id UUID NOT NULL REFERENCES template_versions(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_records_workspace_id ON custom_records(workspace_id);
CREATE INDEX IF NOT EXISTS idx_custom_records_version_id ON custom_records(template_version_id);

-- 5. Table: field_values
CREATE TABLE IF NOT EXISTS field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES custom_records(id) ON DELETE CASCADE,
    field_definition_id UUID NOT NULL REFERENCES field_definitions(id) ON DELETE CASCADE,
    value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_record_field UNIQUE (record_id, field_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_field_values_record_id ON field_values(record_id);

-- 6. Alter applications table: Add template_version_id and custom_fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS template_version_id UUID REFERENCES template_versions(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_applications_template_version ON applications(template_version_id);

