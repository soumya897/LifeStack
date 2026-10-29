import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  api,
  JobApplication,
  ApplicationStatus,
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { JobStatsBar } from './components/JobStatsBar';
import { JobTableView } from './components/JobTableView';
import { JobKanbanView } from './components/JobKanbanView';
import { ApplicationModal } from './components/ApplicationModal';

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Saved', value: 'SAVED' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Screening', value: 'SCREENING' },
  { label: 'Assessment', value: 'ASSESSMENT' },
  { label: 'Interviewing', value: 'INTERVIEW' },
  { label: 'Offer', value: 'OFFER' },
  { label: 'Hired', value: 'HIRED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

export const JobTrackerPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  // Query: Stats summary
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['job-stats', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return undefined;
      const res = await api.jobAnalytics.summary(currentWorkspace.id);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Query: Applications list
  const {
    data: applicationsData,
    isLoading: isLoadingApps,
    isFetching,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ['job-applications', currentWorkspace?.id, statusFilter, search],
    queryFn: async () => {
      if (!currentWorkspace?.id) return { content: [] };
      const res = await api.applications.list(currentWorkspace.id, {
        status: statusFilter ? (statusFilter as ApplicationStatus) : undefined,
        search: search.trim() || undefined,
        size: 100,
      });
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  const applications = applicationsData?.content || [];

  // Mutation: Create Application
  const createMutation = useMutation({
    mutationFn: (payload: CreateApplicationPayload) => api.applications.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Mutation: Update Application
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateApplicationPayload }) =>
      api.applications.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Mutation: Delete Application
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.applications.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const handleModalSubmit = async (
    payload: CreateApplicationPayload | UpdateApplicationPayload
  ) => {
    if (editingApplication) {
      await updateMutation.mutateAsync({
        id: editingApplication.id,
        payload: payload as UpdateApplicationPayload,
      });
    } else {
      await createMutation.mutateAsync(payload as CreateApplicationPayload);
    }
  };

  const handleQuickStatusChange = async (
    app: JobApplication,
    newStatus: ApplicationStatus
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: app.id,
        payload: { status: newStatus },
      });
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const handleDelete = async (app: JobApplication) => {
    if (
      window.confirm(
        `Are you sure you want to delete application for "${app.jobTitle}" at ${app.companyName}?`
      )
    ) {
      await deleteMutation.mutateAsync(app.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                  Job Tracker & Pipeline
                </h1>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                  Kanban & Table
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Track job applications, recruitment stages, interviews, and status transitions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              refetchStats();
              refetchApps();
            }}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200/80 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-brand-600' : 'text-slate-400'}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingApplication(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Track Application
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <JobStatsBar stats={statsData} isLoading={isLoadingStats} />

      {/* Filter and View Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search & Filter */}
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, title, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-brand-500 focus:outline-hidden transition-colors"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200/80 p-1 bg-slate-100/70 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 text-brand-600" />
            Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="h-3.5 w-3.5 text-indigo-600" />
            Table
          </button>
        </div>
      </div>

      {/* Main Board or Table Content */}
      {viewMode === 'kanban' ? (
        <JobKanbanView
          applications={applications}
          onSelect={(app) => navigate(`/jobs/${app.id}`)}
          onStatusChange={handleQuickStatusChange}
          isLoading={isLoadingApps}
        />
      ) : (
        <JobTableView
          applications={applications}
          onSelect={(app) => navigate(`/jobs/${app.id}`)}
          onEdit={(app) => {
            setEditingApplication(app);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          onStatusChange={handleQuickStatusChange}
          isLoading={isLoadingApps}
        />
      )}

      {/* Application Create / Edit Modal */}
      {currentWorkspace?.id && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingApplication(null);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingApplication}
          workspaceId={currentWorkspace.id}
        />
      )}
    </div>
  );
};
