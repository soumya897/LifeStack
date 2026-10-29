export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  role?: UserRole;
  status?: UserStatus;
  lastActiveAt?: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  settings: string;
  createdAt: string;
  updatedAt: string;
}

export type RoadmapStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type ProgressMode = 'TOPIC' | 'TASK' | 'WEIGHTED';
export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVISING';

export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ProblemStatus = 'UNSOLVED' | 'ATTEMPTED' | 'SOLVED' | 'MASTERED';

export interface Topic {
  id: string;
  roadmapId: string;
  title: string;
  description?: string;
  status: TopicStatus;
  sortOrder: number;
  weight: number;
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  daysRemaining?: number | null;
  isOverdue: boolean;
}

export interface Roadmap {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: RoadmapStatus;
  progressMode: ProgressMode;
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  progressPercentage: number;
  totalTopics: number;
  completedTopics: number;
  daysRemaining?: number | null;
  isOverdue: boolean;
  elapsedDays: number;
  topics?: Topic[];
}

export interface ProblemSolution {
  id: string;
  problemId: string;
  language: string;
  code: string;
  approach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  id: string;
  topicId: string;
  topicTitle: string;
  roadmapId: string;
  roadmapName: string;
  title: string;
  statement?: string;
  difficulty: ProblemDifficulty;
  platformUrl?: string;
  status: ProblemStatus;
  solutionsCount: number;
  solutions?: ProblemSolution[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  content?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  workspaceId: string;
  name: string;
  resourceType: string;
  url: string;
  createdAt: string;
}

export interface CreateRoadmapPayload {
  workspaceId: string;
  name: string;
  description?: string;
  progressMode?: ProgressMode;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateRoadmapPayload {
  name?: string;
  description?: string;
  status?: RoadmapStatus;
  progressMode?: ProgressMode;
  startDate?: string;
  targetDate?: string;
}

export interface CreateTopicPayload {
  title: string;
  description?: string;
  weight?: number;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateTopicPayload {
  title?: string;
  description?: string;
  status?: TopicStatus;
  weight?: number;
  startDate?: string;
  targetDate?: string;
  sortOrder?: number;
}

export interface CreateProblemPayload {
  title: string;
  statement?: string;
  difficulty?: ProblemDifficulty;
  platformUrl?: string;
}

export interface UpdateProblemPayload {
  title?: string;
  statement?: string;
  difficulty?: ProblemDifficulty;
  platformUrl?: string;
  status?: ProblemStatus;
}

export interface CreateSolutionPayload {
  language: string;
  code: string;
  approach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface UpdateSolutionPayload {
  language?: string;
  code?: string;
  approach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface CreateNotePayload {
  workspaceId: string;
  title: string;
  content?: string;
  tags?: string;
  topicId?: string;
  problemId?: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  tags?: string;
}

export interface CreateResourcePayload {
  workspaceId: string;
  name: string;
  resourceType?: string;
  url: string;
  topicId?: string;
}

export type ScheduleItemType = 'TASK' | 'TOPIC' | 'ROADMAP' | 'JOB_APPLICATION' | 'CUSTOM_ALERT';
export type AlertPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ScheduleStatus = 'PENDING' | 'COMPLETED' | 'DISMISSED';

export interface ScheduleItem {
  id: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  description?: string;
  itemType: ScheduleItemType;
  targetId?: string;
  targetName?: string;
  scheduledAt: string;
  priority: AlertPriority;
  status: ScheduleStatus;
  soundEnabled: boolean;
  notifiedAt?: string;
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  workspaceId: string;
  title: string;
  description?: string;
  itemType?: ScheduleItemType;
  targetId?: string;
  targetName?: string;
  scheduledAt: string;
  priority?: AlertPriority;
  soundEnabled?: boolean;
}

export interface UpdateSchedulePayload {
  title?: string;
  description?: string;
  itemType?: ScheduleItemType;
  targetId?: string;
  targetName?: string;
  scheduledAt?: string;
  priority?: AlertPriority;
  status?: ScheduleStatus;
  soundEnabled?: boolean;
}

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'SCREENING'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ON_HOLD';

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type InterviewEventType =
  | 'RECRUITER_SCREEN'
  | 'TECHNICAL'
  | 'SYSTEM_DESIGN'
  | 'BEHAVIORAL'
  | 'MANAGERIAL'
  | 'FINAL_ROUND'
  | 'OTHER';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type InterviewResult = 'PENDING' | 'PASSED' | 'FAILED';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface JobApplication {
  id: string;
  workspaceId: string;
  companyName: string;
  jobTitle: string;
  source?: string;
  jobUrl?: string;
  appliedAt?: string;
  status: ApplicationStatus;
  location?: string;
  workMode?: WorkMode;
  salary?: string;
  notes?: string;
  followUpAt?: string;
  interviewRoundsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewEvent {
  id: string;
  applicationId: string;
  companyName?: string;
  roundName: string;
  eventType: InterviewEventType;
  scheduledAt?: string;
  occurredAt?: string;
  status: InterviewStatus;
  result: InterviewResult;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationHistory {
  id: string;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  notes?: string;
  createdAt: string;
}

export interface ApplicationDetail extends JobApplication {
  interviews: InterviewEvent[];
  history: ApplicationHistory[];
  attachedNoteIds: string[];
}

export interface JobFunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
}

export interface JobStatsSummary {
  totalApplications: number;
  appliedThisMonth: number;
  activeInterviews: number;
  offersCount: number;
  hiredCount?: number;
  rejectionsCount: number;
  followUpsDue: number;
  offerRatePercentage?: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  stageFunnel?: JobFunnelStage[];
}

export interface RoadmapProgressAnalyticsItem {
  id: string;
  name: string;
  status: string;
  progress?: number;
  progressPercentage?: number;
  totalTopics: number;
  completedTopics: number;
  targetDate?: string;
  overdue: boolean;
}

export interface RoadmapAnalytics {
  totalRoadmaps: number;
  activeRoadmaps: number;
  completedRoadmaps: number;
  totalTopics: number;
  completedTopics: number;
  topicCompletionRate?: number;
  overallTopicCompletionPercentage?: number;
  totalProblems: number;
  solvedProblems: number;
  problemSolveRate?: number;
  problemsByDifficulty: Record<string, number>;
  problemsByStatus: Record<string, number>;
  totalNotes: number;
  roadmaps: RoadmapProgressAnalyticsItem[];
}

export interface MonthlyVelocityItem {
  monthKey: string;
  label: string;
  applicationsCount: number;
  interviewsCount: number;
}

export interface JobMonthlyVelocity {
  months: MonthlyVelocityItem[];
}

export interface SourcePerformanceItem {
  source: string;
  totalApplications: number;
  interviewCount: number;
  offerCount: number;
  interviewRate: number;
  offerRate: number;
}

export interface JobSourceAnalytics {
  sources: SourcePerformanceItem[];
}

export interface InterviewAnalytics {
  totalInterviews: number;
  upcomingInterviews: number;
  completedInterviews: number;
  byRoundType: Record<string, number>;
  byStatus: Record<string, number>;
  byResult: Record<string, number>;
}

export interface CreateApplicationPayload {
  workspaceId: string;
  companyName: string;
  jobTitle: string;
  source?: string;
  jobUrl?: string;
  appliedAt?: string;
  status?: ApplicationStatus;
  location?: string;
  workMode?: WorkMode;
  salary?: string;
  notes?: string;
  followUpAt?: string;
}

export interface UpdateApplicationPayload {
  companyName?: string;
  jobTitle?: string;
  source?: string;
  jobUrl?: string;
  appliedAt?: string;
  status?: ApplicationStatus;
  location?: string;
  workMode?: WorkMode;
  salary?: string;
  notes?: string;
  followUpAt?: string;
}

export interface CreateInterviewPayload {
  roundName: string;
  eventType?: InterviewEventType;
  scheduledAt?: string;
  occurredAt?: string;
  status?: InterviewStatus;
  result?: InterviewResult;
  notes?: string;
}

export interface UpdateInterviewPayload {
  roundName?: string;
  eventType?: InterviewEventType;
  scheduledAt?: string;
  occurredAt?: string;
  status?: InterviewStatus;
  result?: InterviewResult;
  notes?: string;
}

export interface HealthCheckData {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  checks: {
    database: {
      status: string;
      product?: string;
      version?: string;
      error?: string;
    };
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  settings?: string;
}

export interface RoadmapSummaryItem {
  id: string;
  name: string;
  status: string;
  progressPercentage: number;
  targetDate?: string;
}

export interface TaskSummaryItem {
  id: string;
  title: string;
  status: string;
  dueAt?: string;
  overdue: boolean;
}

export interface ApplicationSummaryItem {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  appliedAt?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardSummary {
  workspaceId: string;
  workspaceName: string;
  activeRoadmapsCount: number;
  completedRoadmapsCount: number;
  tasksDueTodayCount: number;
  overdueTasksCount: number;
  completedTasksCount: number;
  applicationsSubmittedThisMonthCount: number;
  upcomingInterviewsCount: number;
  followUpsDueCount: number;
  recentRoadmaps: RoadmapSummaryItem[];
  priorityTasks: TaskSummaryItem[];
  recentApplications: ApplicationSummaryItem[];
  recentActivity: ActivityItem[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Checks whether an error is caused by backend or database service cold-starting, sleeping, or initializing.
 */
export function isCloudConnectingError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof ApiError) {
    if (error.status === 0 || [500, 502, 503, 504].includes(error.status)) return true;
    const msg = (error.message || '').toLowerCase();
    return (
      msg.includes('connecting') ||
      msg.includes('initializing') ||
      msg.includes('service') ||
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('failed to fetch') ||
      msg.includes('cloud')
    );
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('refused') ||
      msg.includes('offline')
    );
  }
  return false;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'same-origin',
    });
  } catch (err: unknown) {
    // Network error / container asleep / cold start
    throw new ApiError(
      0,
      'Secure cloud services are waking up and connecting. Please hold on a moment...',
      err
    );
  }

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: response.statusText || 'Network request failed',
    data: null as unknown as T,
    timestamp: new Date().toISOString(),
  }));

  if (!response.ok || !body.success) {
    let cleanMessage = body.message || 'API error occurred';
    const lower = cleanMessage.toLowerCase();
    // Sanitize any raw database or infrastructure leakage
    if (
      lower.includes('supabase') ||
      lower.includes('hikari') ||
      lower.includes('postgres') ||
      lower.includes('psqlexception') ||
      lower.includes('connection refused') ||
      lower.includes('connection is not available') ||
      lower.includes('connection timed out') ||
      lower.includes('driver') ||
      [502, 503, 504].includes(response.status)
    ) {
      cleanMessage = 'Secure cloud services are waking up and connecting. Please hold on a moment...';
    }
    throw new ApiError(response.status, cleanMessage, body.data);
  }

  return body;
}

export interface DailyDauPoint {
  date: string;
  activeUsers: number;
}

export interface DauMetrics {
  todayDau: number;
  sevenDayAverageDau: number;
  thirtyDayAverageDau: number;
  history: DailyDauPoint[];
}

export interface AdminMetricsResponse {
  activeSessions: number;
  activeUsersCount: number;
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  dauMetrics: DauMetrics;
}

export interface DatabaseHealth {
  status: string;
  latencyMs: number;
  product: string;
  version: string;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
}

export interface FlywayHealth {
  status: string;
  currentVersion: string;
  lastMigration: string;
  installedOn: string;
  totalMigrations: number;
}

export interface JvmHealth {
  usedMemoryMb: number;
  totalMemoryMb: number;
  maxMemoryMb: number;
  memoryUtilizationPercent: number;
  activeThreads: number;
  availableProcessors: number;
}

export interface ServerHealth {
  status: string;
  uptimeMillis: number;
  uptimeFormatted: string;
  startTime: string;
  javaVersion: string;
  springBootVersion: string;
}

export interface CloudSecurityHealth {
  environment: string;
  isolationMode: string;
  tokenSecurity: string;
  publicSignupPolicy: string;
  adminProvisioningPolicy: string;
  auditLogs: string[];
}

export interface AdminSystemHealthResponse {
  database: DatabaseHealth;
  flyway: FlywayHealth;
  security?: CloudSecurityHealth;
  jvm?: JvmHealth;
  server: ServerHealth;
}

export interface AdminUserItem {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  timezone: string;
  createdAt: string;
  lastActiveAt?: string | null;
  workspacesCount: number;
}

export interface AdminUserQueryOptions {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  direction?: string;
}

export interface CreateAdminPayload {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}

export const api = {
  health: {
    check: () => apiClient<HealthCheckData>('/health'),
  },
  auth: {
    register: (payload: RegisterPayload) =>
      apiClient<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginPayload) =>
      apiClient<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      apiClient<void>('/auth/logout', {
        method: 'POST',
      }),
  },
  users: {
    me: () => apiClient<User>('/users/me'),
    deleteMe: () =>
      apiClient<void>('/users/me', {
        method: 'DELETE',
      }),
  },
  workspaces: {
    list: () => apiClient<Workspace[]>('/workspaces'),
    get: (id: string) => apiClient<Workspace>(`/workspaces/${id}`),
    create: (payload: CreateWorkspacePayload) =>
      apiClient<Workspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateWorkspacePayload) =>
      apiClient<Workspace>(`/workspaces/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/workspaces/${id}`, {
        method: 'DELETE',
      }),
  },
  roadmaps: {
    list: (workspaceId: string, status?: RoadmapStatus) => {
      const params = new URLSearchParams({ workspaceId });
      if (status) params.append('status', status);
      return apiClient<Roadmap[]>(`/roadmaps?${params.toString()}`);
    },
    get: (id: string) => apiClient<Roadmap>(`/roadmaps/${id}`),
    create: (payload: CreateRoadmapPayload) =>
      apiClient<Roadmap>('/roadmaps', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateRoadmapPayload) =>
      apiClient<Roadmap>(`/roadmaps/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/roadmaps/${id}`, {
        method: 'DELETE',
      }),
  },
  topics: {
    list: (roadmapId: string) => apiClient<Topic[]>(`/roadmaps/${roadmapId}/topics`),
    get: (id: string) => apiClient<Topic>(`/topics/${id}`),
    create: (roadmapId: string, payload: CreateTopicPayload) =>
      apiClient<Topic>(`/roadmaps/${roadmapId}/topics`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateTopicPayload) =>
      apiClient<Topic>(`/topics/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, status: TopicStatus) =>
      apiClient<Topic>(`/topics/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    reorder: (roadmapId: string, topicIds: string[]) =>
      apiClient<Topic[]>(`/roadmaps/${roadmapId}/topics/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ topicIds }),
      }),
    delete: (id: string) =>
      apiClient<void>(`/topics/${id}`, {
        method: 'DELETE',
      }),
  },
  problems: {
    list: (workspaceId: string, status?: ProblemStatus, difficulty?: ProblemDifficulty) => {
      const params = new URLSearchParams({ workspaceId });
      if (status) params.append('status', status);
      if (difficulty) params.append('difficulty', difficulty);
      return apiClient<Problem[]>(`/problems?${params.toString()}`);
    },
    listByTopic: (topicId: string) => apiClient<Problem[]>(`/topics/${topicId}/problems`),
    get: (id: string) => apiClient<Problem>(`/problems/${id}`),
    create: (topicId: string, payload: CreateProblemPayload) =>
      apiClient<Problem>(`/topics/${topicId}/problems`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateProblemPayload) =>
      apiClient<Problem>(`/problems/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/problems/${id}`, {
        method: 'DELETE',
      }),
  },
  solutions: {
    list: (problemId: string) => apiClient<ProblemSolution[]>(`/problems/${problemId}/solutions`),
    create: (problemId: string, payload: CreateSolutionPayload) =>
      apiClient<ProblemSolution>(`/problems/${problemId}/solutions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateSolutionPayload) =>
      apiClient<ProblemSolution>(`/solutions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/solutions/${id}`, {
        method: 'DELETE',
      }),
  },
  notes: {
    list: (workspaceId: string, search?: string) => {
      const params = new URLSearchParams({ workspaceId });
      if (search) params.append('search', search);
      return apiClient<Note[]>(`/notes?${params.toString()}`);
    },
    listByTopic: (topicId: string) => apiClient<Note[]>(`/topics/${topicId}/notes`),
    listByProblem: (problemId: string) => apiClient<Note[]>(`/problems/${problemId}/notes`),
    get: (id: string) => apiClient<Note>(`/notes/${id}`),
    create: (payload: CreateNotePayload) =>
      apiClient<Note>('/notes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateNotePayload) =>
      apiClient<Note>(`/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/notes/${id}`, {
        method: 'DELETE',
      }),
    linkTopic: (topicId: string, noteId: string) =>
      apiClient<void>(`/topics/${topicId}/notes/${noteId}`, {
        method: 'POST',
      }),
    unlinkTopic: (topicId: string, noteId: string) =>
      apiClient<void>(`/topics/${topicId}/notes/${noteId}`, {
        method: 'DELETE',
      }),
    linkProblem: (problemId: string, noteId: string) =>
      apiClient<void>(`/problems/${problemId}/notes/${noteId}`, {
        method: 'POST',
      }),
    unlinkProblem: (problemId: string, noteId: string) =>
      apiClient<void>(`/problems/${problemId}/notes/${noteId}`, {
        method: 'DELETE',
      }),
  },
  resources: {
    list: (workspaceId: string) => {
      const params = new URLSearchParams({ workspaceId });
      return apiClient<Resource[]>(`/resources?${params.toString()}`);
    },
    listByTopic: (topicId: string) => apiClient<Resource[]>(`/topics/${topicId}/resources`),
    create: (payload: CreateResourcePayload) =>
      apiClient<Resource>('/resources', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/resources/${id}`, {
        method: 'DELETE',
      }),
    linkTopic: (topicId: string, resourceId: string) =>
      apiClient<void>(`/topics/${topicId}/resources/${resourceId}`, {
        method: 'POST',
      }),
    unlinkTopic: (topicId: string, resourceId: string) =>
      apiClient<void>(`/topics/${topicId}/resources/${resourceId}`, {
        method: 'DELETE',
      }),
  },
  schedules: {
    list: (workspaceId: string, status?: ScheduleStatus, itemType?: ScheduleItemType) => {
      const params = new URLSearchParams({ workspaceId });
      if (status) params.append('status', status);
      if (itemType) params.append('itemType', itemType);
      return apiClient<ScheduleItem[]>(`/schedules?${params.toString()}`);
    },
    get: (id: string) => apiClient<ScheduleItem>(`/schedules/${id}`),
    create: (payload: CreateSchedulePayload) =>
      apiClient<ScheduleItem>('/schedules', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateSchedulePayload) =>
      apiClient<ScheduleItem>(`/schedules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, status: ScheduleStatus) =>
      apiClient<ScheduleItem>(`/schedules/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    acknowledge: (id: string) =>
      apiClient<ScheduleItem>(`/schedules/${id}/acknowledge`, {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      apiClient<void>(`/schedules/${id}`, {
        method: 'DELETE',
      }),
  },
  analytics: {
    dashboard: (workspaceId?: string) => {
      const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
      return apiClient<DashboardSummary>(`/analytics/dashboard${query}`);
    },
    roadmaps: (workspaceId?: string) => {
      const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
      return apiClient<RoadmapAnalytics>(`/analytics/roadmaps${query}`);
    },
    jobSummary: (workspaceId?: string) => {
      const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
      return apiClient<JobStatsSummary>(`/analytics/jobs/summary${query}`);
    },
    jobMonthly: (workspaceId?: string) => {
      const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
      return apiClient<JobMonthlyVelocity>(`/analytics/jobs/monthly${query}`);
    },
    jobBySource: (workspaceId?: string) => {
      const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
      return apiClient<JobSourceAnalytics>(`/analytics/jobs/by-source${query}`);
    },
    jobInterviews: (workspaceId?: string) => {
      const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
      return apiClient<InterviewAnalytics>(`/analytics/jobs/interviews${query}`);
    },
  },
  applications: {
    list: (
      workspaceId: string,
      options?: {
        status?: ApplicationStatus;
        source?: string;
        search?: string;
        page?: number;
        size?: number;
      }
    ) => {
      const params = new URLSearchParams({ workspaceId });
      if (options?.status) params.append('status', options.status);
      if (options?.source) params.append('source', options.source);
      if (options?.search) params.append('search', options.search);
      if (options?.page !== undefined) params.append('page', options.page.toString());
      if (options?.size !== undefined) params.append('size', options.size.toString());
      return apiClient<PageResponse<JobApplication>>(`/applications?${params.toString()}`);
    },
    get: (id: string) => apiClient<ApplicationDetail>(`/applications/${id}`),
    create: (payload: CreateApplicationPayload) =>
      apiClient<JobApplication>('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateApplicationPayload) =>
      apiClient<JobApplication>(`/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/applications/${id}`, {
        method: 'DELETE',
      }),
    linkNote: (appId: string, noteId: string) =>
      apiClient<void>(`/applications/${appId}/notes/${noteId}`, {
        method: 'POST',
      }),
    unlinkNote: (appId: string, noteId: string) =>
      apiClient<void>(`/applications/${appId}/notes/${noteId}`, {
        method: 'DELETE',
      }),
  },
  interviews: {
    list: (applicationId: string) =>
      apiClient<InterviewEvent[]>(`/applications/${applicationId}/interviews`),
    create: (applicationId: string, payload: CreateInterviewPayload) =>
      apiClient<InterviewEvent>(`/applications/${applicationId}/interviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateInterviewPayload) =>
      apiClient<InterviewEvent>(`/interviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiClient<void>(`/interviews/${id}`, {
        method: 'DELETE',
      }),
  },
  jobAnalytics: {
    summary: (workspaceId: string) =>
      apiClient<JobStatsSummary>(
        `/analytics/jobs/summary?workspaceId=${encodeURIComponent(workspaceId)}`
      ),
  },
  admin: {
    getMetrics: () => apiClient<AdminMetricsResponse>('/admin/metrics'),
    getSystemHealth: () => apiClient<AdminSystemHealthResponse>('/admin/system-health'),
    getUsers: (options?: AdminUserQueryOptions) => {
      const params = new URLSearchParams();
      if (options?.page !== undefined) params.append('page', options.page.toString());
      if (options?.size !== undefined) params.append('size', options.size.toString());
      if (options?.search) params.append('search', options.search);
      if (options?.status) params.append('status', options.status);
      if (options?.role) params.append('role', options.role);
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.direction) params.append('direction', options.direction);
      return apiClient<PageResponse<AdminUserItem>>(`/admin/users?${params.toString()}`);
    },
    createAdmin: (payload: CreateAdminPayload) =>
      apiClient<AdminUserItem>('/admin/users/create-admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    blockUser: (userId: string) =>
      apiClient<AdminUserItem>(`/admin/users/${userId}/block`, {
        method: 'POST',
      }),
    unblockUser: (userId: string) =>
      apiClient<AdminUserItem>(`/admin/users/${userId}/unblock`, {
        method: 'POST',
      }),
    deleteUser: (userId: string) =>
      apiClient<void>(`/admin/users/${userId}`, {
        method: 'DELETE',
      }),
  },
};
