-- ==============================================================================
-- LifeStack — Milestone 6: Job Tracker Schema Migration
-- Creates applications, interview_events, application_history, and application_notes
-- ==============================================================================

-- Table: applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    source VARCHAR(100),
    job_url TEXT,
    applied_at DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    location VARCHAR(150),
    work_mode VARCHAR(50) DEFAULT 'REMOTE',
    salary VARCHAR(100),
    notes TEXT,
    follow_up_at DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_workspace_id ON applications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_applications_owner_id ON applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_name);

-- Table: interview_events
CREATE TABLE IF NOT EXISTS interview_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'TECHNICAL',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    occurred_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    result VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interview_events_application_id ON interview_events(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_events_scheduled_at ON interview_events(scheduled_at);

-- Table: application_history
CREATE TABLE IF NOT EXISTS application_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_application_history_application_id ON application_history(application_id);

-- Junction Table: application_notes
CREATE TABLE IF NOT EXISTS application_notes (
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (application_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_note_id ON application_notes(note_id);
