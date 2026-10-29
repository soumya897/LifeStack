import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CalendarCheck,
  Briefcase,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  Layers,
  Calendar,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard-summary', currentWorkspace?.id],
    queryFn: () => api.analytics.dashboard(currentWorkspace?.id),
    enabled: !!currentWorkspace?.id,
  });

  const summary = dashboardData?.data;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {greeting}, {user?.displayName || 'Developer'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Workspace: <span className="font-semibold text-slate-800">{currentWorkspace?.name || 'Personal Workspace'}</span> &bull; Daily priorities and learning velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-brand-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{error instanceof Error ? error.message : 'Failed to load dashboard summary.'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold underline hover:no-underline text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Roadmaps */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Learning Roadmaps</span>
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {isLoading ? <span className="h-7 w-12 block animate-pulse rounded bg-slate-200" /> : summary?.activeRoadmapsCount ?? 0}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{summary?.completedRoadmapsCount ?? 0} completed</span>
            <span>in this workspace</span>
          </div>
        </div>

        {/* Card 2: Tasks Due & Overdue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tasks Due Today</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {isLoading ? <span className="h-7 w-12 block animate-pulse rounded bg-slate-200" /> : summary?.tasksDueTodayCount ?? 0}
            </span>
            {(summary?.overdueTasksCount ?? 0) > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                {summary?.overdueTasksCount} overdue
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>{summary?.completedTasksCount ?? 0} completed tasks overall</span>
          </div>
        </div>

        {/* Card 3: Job Applications */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Applications This Month</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {isLoading ? <span className="h-7 w-12 block animate-pulse rounded bg-slate-200" /> : summary?.applicationsSubmittedThisMonthCount ?? 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>By submission date (monthly report)</span>
          </div>
        </div>

        {/* Card 4: Upcoming Interviews */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Upcoming Interviews</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {isLoading ? <span className="h-7 w-12 block animate-pulse rounded bg-slate-200" /> : summary?.upcomingInterviewsCount ?? 0}
            </span>
            {(summary?.followUpsDueCount ?? 0) > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                {summary?.followUpsDueCount} follow-ups
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>Scheduled assessment & rounds</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </span>
          <span className="text-xs text-slate-400">Launch learning or job workflow</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => navigate('/learning')}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200/60 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-brand-600" />
            <span>Create Roadmap</span>
          </button>
          <button
            onClick={() => navigate('/today')}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200/60 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors"
          >
            <Calendar className="h-4 w-4 text-amber-600" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200/60 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
          >
            <Briefcase className="h-4 w-4 text-purple-600" />
            <span>Track Application</span>
          </button>
          <button
            onClick={() => navigate('/notes')}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200/60 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            <span>Write Note</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Active Roadmaps / Tasks vs Activity Timeline */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Roadmaps Widget */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">Active Roadmaps</h2>
              </div>
              <button
                onClick={() => navigate('/learning')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all roadmaps <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Empty State / Roadmaps List */}
            {summary?.recentRoadmaps && summary.recentRoadmaps.length > 0 ? (
              <div className="mt-4 space-y-3">
                {summary.recentRoadmaps.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/learning/${r.id}`)}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{r.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{r.status}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-brand-600">{r.progressPercentage}%</span>
                      <p className="text-[10px] text-slate-400">Target: {r.targetDate || 'None'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">No active roadmaps in this workspace</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  Create a structured learning plan like DSA, Core Java, or Spring Boot to track topics and progress.
                </p>
                <button
                  onClick={() => navigate('/learning')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Start DSA Roadmap (Milestone 4)</span>
                </button>
              </div>
            )}
          </div>

          {/* Actionable Tasks Widget */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">Tasks Due & Overdue</h2>
              </div>
              <button
                onClick={() => navigate('/today')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Open Today view <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {summary?.priorityTasks && summary.priorityTasks.length > 0 ? (
              <div className="mt-4 space-y-2">
                {summary.priorityTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <span className="text-xs font-medium text-slate-800">{task.title}</span>
                    <span className={`text-[10px] font-bold ${task.overdue ? 'text-red-600' : 'text-slate-500'}`}>
                      {task.overdue ? 'Overdue' : 'Due today'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                <p className="font-semibold text-slate-700">All clear!</p>
                <p className="mt-0.5">No tasks are due or overdue in this workspace today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Recent Activity & Vertical Slice Tracker */}
        <div className="space-y-6">
          {/* Recent Activity Feed */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Activity className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            </div>

            <div className="mt-4 space-y-4">
              {summary?.recentActivity && summary.recentActivity.length > 0 ? (
                summary.recentActivity.map((act) => (
                  <div key={act.id} className="flex gap-3 text-xs">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{act.title}</p>
                      <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">{act.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(act.timestamp).toLocaleDateString()} at{' '}
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged yet.</p>
              )}
            </div>
          </div>

          {/* Vertical Slice Progress Tracker Card (Section 16) */}
          <div className="rounded-xl border border-brand-100 bg-linear-to-br from-brand-50/50 to-white p-5 shadow-2xs">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                Vertical Slice Release Gate
              </h3>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              Tracing Section 16 end-to-end milestone progress:
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>M1: Architecture & Flyway</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>M2: Auth & Workspace Tenancy</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>M3: Workspaces & Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>M4: Roadmaps & Progress Engine</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>M5: Notes, Resources & Coding Tracker</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>M6: Job Tracker & Interview Pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                <span>M7: Dynamic Templates & Custom Fields</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
