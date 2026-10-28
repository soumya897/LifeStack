import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Activity,
  Database,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  GitBranch,
  RefreshCw
} from 'lucide-react';

export function DashboardPage() {
  const { data: health, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.health.check(),
  });

  const healthData = health?.data;
  const dbStatus = healthData?.checks?.database?.status || 'UNKNOWN';
  const dbProduct = healthData?.checks?.database?.product || 'PostgreSQL';
  const dbVersion = healthData?.checks?.database?.version || '18.x';

  return (
    <div className="space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Welcome to LifeStack
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Modular Monolith Foundation &bull; Milestone 1 Active
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-brand-600' : ''}`} />
          Refresh Health Check
        </button>
      </div>

      {/* System Health Status Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">System Integration Status</h2>
              <p className="text-xs text-slate-500">
                End-to-end communication via Vite dev proxy (/api/* &rarr; Spring Boot &rarr; PostgreSQL)
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              healthData?.status === 'UP'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                healthData?.status === 'UP' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            Status: {healthData?.status || (isLoading ? 'Checking...' : 'Degraded')}
          </span>
        </div>

        {/* Health Metrics Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Spring Boot API */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Layers className="h-4 w-4 text-brand-600" />
              <span>Spring Boot Backend</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900">
              {isLoading ? 'Checking...' : isError ? 'Offline' : `v${healthData?.version || '1.0.0'}`}
            </div>
            <p className="mt-1 text-xs text-slate-500">Modular Monolith Architecture</p>
          </div>

          {/* PostgreSQL DB */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Database className="h-4 w-4 text-emerald-600" />
              <span>Database Connection</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900">
              {isLoading ? 'Checking...' : dbStatus}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {dbProduct} ({dbVersion}) &bull; Flyway V1 Applied
            </p>
          </div>

          {/* Environment */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <GitBranch className="h-4 w-4 text-purple-600" />
              <span>Active Profile</span>
            </div>
            <div className="mt-2 text-lg font-bold text-slate-900 capitalize">
              {healthData?.environment || 'local'}
            </div>
            <p className="mt-1 text-xs text-slate-500">Environment Config Active</p>
          </div>

          {/* Response Time */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Last Checked</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900 truncate">
              {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Pending'}
            </div>
            <p className="mt-1 text-xs text-slate-500">Live Polling (30s interval)</p>
          </div>
        </div>
      </div>

      {/* Recommended Vertical Slice Roadmap */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Section 16: Recommended First Vertical Slice
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          The verified release gate before broadening application scope:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-lg border border-brand-200 bg-brand-50/50 p-4">
            <div>
              <span className="inline-block rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                Step 1 &bull; M1 (Done)
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Project Foundation</h3>
              <p className="mt-1 text-xs text-slate-600">
                Spring Boot modular monolith, PostgreSQL schema, Flyway migrations, Vite React frontend, and reverse proxy.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Complete
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Step 2 &bull; M2
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Auth & Workspace</h3>
              <p className="mt-1 text-xs text-slate-600">
                Register account, secure password hashing, session cookies, ownership enforcement, and default workspace.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400">
              Next in queue <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Step 3 &bull; M4-M5
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Roadmap & Topic Flow</h3>
              <p className="mt-1 text-xs text-slate-600">
                Create DSA roadmap, add ArrayList topic, attach coding problem and note, separate mastery status from topic completion.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400">
              Pending Step 2
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Step 4 &bull; Gate
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Progress Verification</h3>
              <p className="mt-1 text-xs text-slate-600">
                Backend calculates topic progress percentage, dashboard updates live. Verifies full slice end-to-end.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400">
              Release Gate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
