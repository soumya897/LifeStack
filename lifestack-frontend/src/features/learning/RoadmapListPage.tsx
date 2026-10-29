import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { api, Roadmap, RoadmapStatus } from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { RoadmapModal, RoadmapFormValues } from './RoadmapModal';

export function RoadmapListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<RoadmapStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('create') === 'true');
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [deletingRoadmapId, setDeletingRoadmapId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const { data: roadmaps = [], isLoading } = useQuery({
    queryKey: ['roadmaps', currentWorkspace?.id, statusFilter],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const filter = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await api.roadmaps.list(currentWorkspace.id, filter);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: (values: RoadmapFormValues) => {
      if (!currentWorkspace?.id) throw new Error('No active workspace');
      return api.roadmaps.create({
        workspaceId: currentWorkspace.id,
        name: values.name,
        description: values.description,
        progressMode: values.progressMode,
        startDate: values.startDate || undefined,
        targetDate: values.targetDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: RoadmapFormValues }) => {
      return api.roadmaps.update(id, {
        name: values.name,
        description: values.description,
        status: values.status,
        progressMode: values.progressMode,
        startDate: values.startDate || undefined,
        targetDate: values.targetDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditingRoadmap(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.roadmaps.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeletingRoadmapId(null);
    },
  });

  const handleModalSubmit = async (values: RoadmapFormValues) => {
    if (editingRoadmap) {
      await updateMutation.mutateAsync({ id: editingRoadmap.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const getStatusBadge = (status: RoadmapStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            Completed
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Archived
          </span>
        );
    }
  };

  const getDeadlineBadge = (roadmap: Roadmap) => {
    if (roadmap.status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Finished
        </span>
      );
    }

    if (roadmap.daysRemaining == null) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          No deadline
        </span>
      );
    }

    if (roadmap.isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue by {Math.abs(roadmap.daysRemaining)}d
        </span>
      );
    }

    if (roadmap.daysRemaining === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
          <Clock className="w-3.5 h-3.5" />
          Due today
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        {roadmap.daysRemaining}d remaining
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-brand-600" />
            Learning Roadmaps
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured skill paths and curriculum tracking in{' '}
            <span className="font-semibold text-slate-700">
              {currentWorkspace?.name || 'Workspace'}
            </span>
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRoadmap(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Roadmap
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === filter
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {filter === 'ALL' ? 'All Roadmaps' : filter.charAt(0) + filter.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && roadmaps.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No roadmaps found</h3>
          <p className="text-sm text-slate-500 mb-6">
            {statusFilter === 'ALL'
              ? 'Start organizing your structured learning path by creating your first roadmap.'
              : `No roadmaps currently marked as ${statusFilter.toLowerCase()}.`}
          </p>
          <button
            onClick={() => {
              setEditingRoadmap(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create First Roadmap
          </button>
        </div>
      )}

      {/* Roadmaps Grid */}
      {!isLoading && roadmaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(roadmap.status)}
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {roadmap.progressMode === 'TOPIC'
                          ? 'Topic Progress'
                          : roadmap.progressMode === 'WEIGHTED'
                          ? 'Weighted'
                          : 'Task-based'}
                      </span>
                    </div>
                    <h3
                      onClick={() => navigate(`/learning/${roadmap.id}`)}
                      className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                    >
                      {roadmap.name}
                    </h3>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveDropdownId(activeDropdownId === roadmap.id ? null : roadmap.id)
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdownId === roadmap.id && (
                      <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs">
                        <button
                          onClick={() => {
                            setActiveDropdownId(null);
                            setEditingRoadmap(roadmap);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Edit Details
                        </button>
                        <button
                          onClick={() => {
                            setActiveDropdownId(null);
                            setDeletingRoadmapId(roadmap.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                  {roadmap.description || 'No description provided.'}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{(roadmap.progressPercentage ?? 0).toFixed(1)}%</span>
                    <span className="text-slate-400 font-medium">
                      {roadmap.completedTopics} / {roadmap.totalTopics} topics
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        roadmap.progressPercentage >= 100
                          ? 'bg-emerald-500'
                          : roadmap.progressPercentage > 50
                          ? 'bg-brand-600'
                          : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(100, roadmap.progressPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Timeline / Deadline */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  {getDeadlineBadge(roadmap)}
                  <span className="text-[11px] text-slate-400">
                    {roadmap.elapsedDays > 0 ? `${roadmap.elapsedDays}d ago` : 'Created today'}
                  </span>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div
                onClick={() => navigate(`/learning/${roadmap.id}`)}
                className="px-5 py-3 bg-slate-50 hover:bg-brand-50/60 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-brand-700 transition-colors cursor-pointer"
              >
                <span>Curriculum & Topics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRoadmapId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Delete Roadmap?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this roadmap? All attached topics, tasks, and progress will be permanently removed.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingRoadmapId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingRoadmapId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Roadmap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isModalOpen || editingRoadmap) && currentWorkspace?.id && (
        <RoadmapModal
          isOpen={isModalOpen || !!editingRoadmap}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRoadmap(null);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingRoadmap}
          workspaceId={currentWorkspace.id}
        />
      )}
    </div>
  );
}

