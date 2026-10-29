-- ==============================================================================
-- LifeStack — Milestone 4: Learning Entities Schema Migration
-- Creates roadmaps, topics, tasks, problems, and problem_solutions
-- ==============================================================================

-- Table: roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE,
    target_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_mode VARCHAR(50) NOT NULL DEFAULT 'TOPIC',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_workspace_id ON roadmaps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON roadmaps(status);

-- Table: topics
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    sort_order INT NOT NULL DEFAULT 0,
    weight INT NOT NULL DEFAULT 1 CHECK (weight >= 1),
    start_date DATE,
    target_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_roadmap_id ON topics(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_topics_roadmap_sort ON topics(roadmap_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);

-- Table: tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    weight INT NOT NULL DEFAULT 1 CHECK (weight >= 1),
    due_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_roadmap_id ON tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_topic_id ON tasks(topic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Table: problems
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    statement TEXT,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    platform_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'UNSOLVED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problems_topic_id ON problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);

-- Table: problem_solutions
CREATE TABLE IF NOT EXISTS problem_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    approach TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problem_solutions_problem_id ON problem_solutions(problem_id);

