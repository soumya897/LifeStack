-- ==============================================================================
-- LifeStack — Milestone 5: Notes and Resources Schema Migration
-- Creates notes, resources, and explicit junction tables
-- ==============================================================================

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_workspace_id ON notes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);

-- Table: resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'ARTICLE',
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_workspace_id ON resources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_resources_owner_id ON resources(owner_id);

-- Junction Table: topic_notes
CREATE TABLE IF NOT EXISTS topic_notes (
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (topic_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_notes_topic_id ON topic_notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_notes_note_id ON topic_notes(note_id);

-- Junction Table: problem_notes
CREATE TABLE IF NOT EXISTS problem_notes (
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (problem_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_problem_notes_problem_id ON problem_notes(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_notes_note_id ON problem_notes(note_id);

-- Junction Table: topic_resources
CREATE TABLE IF NOT EXISTS topic_resources (
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (topic_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_resources_topic_id ON topic_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_resources_resource_id ON topic_resources(resource_id);
