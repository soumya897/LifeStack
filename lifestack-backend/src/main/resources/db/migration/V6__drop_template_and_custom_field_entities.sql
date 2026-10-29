-- Migration V6: Drop custom template and field entities to simplify architecture

-- 1. Drop foreign key and columns from applications if present
ALTER TABLE applications DROP COLUMN IF EXISTS template_version_id CASCADE;
ALTER TABLE applications DROP COLUMN IF EXISTS custom_fields CASCADE;

-- 2. Drop custom field value and record tables
DROP TABLE IF EXISTS field_values CASCADE;
DROP TABLE IF EXISTS custom_records CASCADE;

-- 3. Drop template schema tables
DROP TABLE IF EXISTS field_definitions CASCADE;
DROP TABLE IF EXISTS template_versions CASCADE;
DROP TABLE IF EXISTS templates CASCADE;

