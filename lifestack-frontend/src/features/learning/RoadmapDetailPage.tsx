import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  BookOpen,
  Code2,
  FileText,
  Link2,
  ExternalLink,
} from 'lucide-react';
import {
  api,
  Roadmap,
  Topic,
  TopicStatus,
  RoadmapStatus,
  Problem,
  ProblemDifficulty,
  Note,
  Resource,
} from '../../lib/api';
import { RoadmapModal, RoadmapFormValues } from './RoadmapModal';
import { TopicModal, TopicFormValues } from './TopicModal';
import { ProblemModal } from '../coding/ProblemModal';
import { NoteModal } from '../notes/NoteModal';
import { ResourceModal } from '../notes/ResourceModal';

const getTopicStatusBadge = (status: TopicStatus) => {
  switch (status) {
    case 'NOT_STARTED':
      return {
        label: 'Not Started',
        className: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      };
    case 'REVISING':
      return {
        label: 'Revising',
        className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      };
  }
};

interface TopicRowItemProps {
  topic: Topic;
  index: number;
  totalTopics: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isReordering: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TopicStatus) => void;
  workspaceId: string;
}

function TopicRowItem({
  topic,
  index,
  totalTopics,
  onMoveUp,
  onMoveDown,
  isReordering,
  onEdit,
  onDelete,
  onStatusChange,
  workspaceId,
}: TopicRowItemProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  // Attached problems
  const { data: problems = [] } = useQuery<Problem[]>({
    queryKey: ['topic-problems', topic.id],
    queryFn: async () => {
      const res = await api.problems.listByTopic(topic.id);
      return res.data;
    },
  });

  // Attached notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['topic-notes', topic.id],
    queryFn: async () => {
      const res = await api.notes.listByTopic(topic.id);
      return res.data;
    },
  });

  // Attached resources
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ['topic-resources', topic.id],
    queryFn: async () => {
      const res = await api.resources.listByTopic(topic.id);
      return res.data;
    },
  });

  const statusBadge = getTopicStatusBadge(topic.status);

  const handleSaveProblem = async (values: {
    title: string;
    statement?: string;
    difficulty: ProblemDifficulty;
    platformUrl?: string;
  }) => {
    await api.problems.create(topic.id, {
      title: values.title,
      statement: values.statement,
      difficulty: values.difficulty,
      platformUrl: values.platformUrl,
    });
    queryClient.invalidateQueries({ queryKey: ['topic-problems', topic.id] });
    queryClient.invalidateQueries({ queryKey: ['problems'] });
    queryClient.invalidateQueries({ queryKey: ['roadmap-topics'] });
    queryClient.invalidateQueries({ queryKey: ['roadmap-detail'] });
    setIsProblemModalOpen(false);
  };

  const handleSaveNote = async (values: {
    title: string;
    content?: string;
    tags?: string;
  }) => {
    await api.notes.create({
      workspaceId,
      title: values.title,
      content: values.content,
      tags: values.tags,
      topicId: topic.id,
    });
    queryClient.invalidateQueries({ queryKey: ['topic-notes', topic.id] });
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    setIsNoteModalOpen(false);
  };

  const handleSaveResource = async (values: {
    name: string;
    url: string;
    resourceType?: string;
  }) => {
    await api.resources.create({
      workspaceId,
      name: values.name,
      url: values.url,
      resourceType: values.resourceType,
      topicId: topic.id,
    });
    queryClient.invalidateQueries({ queryKey: ['topic-resources', topic.id] });
    queryClient.invalidateQueries({ queryKey: ['resources'] });
    setIsResourceModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Reorder Controls + Index + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={index === 0 || isReordering}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded transition-colors"
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === totalTopics - 1 || isReordering}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded transition-colors"
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
            {index + 1}
          </div>

          {/* Title and details */}
          <div
            className="space-y-1 min-w-0 cursor-pointer select-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors truncate">
                {topic.title}
              </h4>
              {topic.weight > 1 && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  Weight: {topic.weight}
                </span>
              )}
              {/* Practice & Notes Accordion Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                  isExpanded || problems.length > 0 || notes.length > 0
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Code2 className="w-3 h-3 text-emerald-600" />
                <span>{problems.length}</span>
                <span className="text-slate-300">•</span>
                <FileText className="w-3 h-3 text-indigo-600" />
                <span>{notes.length}</span>
                <ChevronDown
                  className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
            {topic.description && (
              <p className="text-xs text-slate-500 line-clamp-1">{topic.description}</p>
            )}
          </div>
        </div>

        {/* Right: Status selector + Deadline + Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
          {topic.targetDate && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              {topic.isOverdue ? (
                <span className="text-rose-600 font-semibold">Overdue</span>
              ) : topic.daysRemaining != null ? (
                `${topic.daysRemaining}d left`
              ) : (
                topic.targetDate
              )}
            </span>
          )}

          <select
            value={topic.status}
            onChange={(e) => onStatusChange(e.target.value as TopicStatus)}
            className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-all cursor-pointer ${statusBadge.className}`}
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REVISING">Revising</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit Topic"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Topic"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Topic Details: Attached Problems & Notes */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-4">
          {/* Coding Problems Sub-section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                Coding Problems ({problems.length})
              </h5>
              <button
                type="button"
                onClick={() => setIsProblemModalOpen(true)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Problem
              </button>
            </div>

            {problems.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                No coding problems linked to this topic yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {problems.map((prob) => {
                  const diffColor =
                    prob.difficulty === 'EASY'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : prob.difficulty === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  const statusColor =
                    prob.status === 'SOLVED' || prob.status === 'MASTERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : prob.status === 'ATTEMPTED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700';

                  return (
                    <Link
                      key={prob.id}
                      to={`/coding/${prob.id}`}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-bold rounded border ${diffColor}`}
                          >
                            {prob.difficulty}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${statusColor}`}>
                            {prob.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 truncate">
                          {prob.title}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {prob.solutionsCount} sol
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes & Resources Sub-section */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Notes ({notes.length}) & Resources ({resources.length})
              </h5>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(true)}
                  className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md border border-indigo-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Note
                </button>
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(true)}
                  className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-md border border-sky-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Resource
                </button>
              </div>
            </div>

            {notes.length === 0 && resources.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                No study notes or external resources attached yet.
              </p>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{note.title}</p>
                      {note.tags && (
                        <p className="text-[10px] text-indigo-600 truncate mt-0.5">#{note.tags}</p>
                      )}
                    </div>
                    <Link
                      to="/notes"
                      className="text-[11px] font-semibold text-indigo-600 hover:underline shrink-0"
                    >
                      View Note →
                    </Link>
                  </div>
                ))}

                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <p className="text-xs font-bold text-slate-800 truncate">{res.name}</p>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-sky-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                      Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attach Modals */}
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSubmit={handleSaveProblem}
        fixedTopicId={topic.id}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleSaveNote}
        fixedTopicId={topic.id}
      />

      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSubmit={handleSaveResource}
      />
    </div>
  );
}

export function RoadmapDetailPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [isDeletingRoadmap, setIsDeletingRoadmap] = useState(false);

  // Fetch roadmap with topics
  const { data: roadmap, isLoading, error } = useQuery<Roadmap>({
    queryKey: ['roadmap', roadmapId],
    queryFn: async () => {
      if (!roadmapId) throw new Error('Missing roadmap ID');
      const res = await api.roadmaps.get(roadmapId);
      return res.data;
    },
    enabled: !!roadmapId,
  });

  const topics = roadmap?.topics || [];

  // Roadmap mutations
  const updateRoadmapMutation = useMutation({
    mutationFn: (values: RoadmapFormValues) => {
      if (!roadmapId) throw new Error('Missing roadmap ID');
      return api.roadmaps.update(roadmapId, {
        name: values.name,
        description: values.description,
        status: values.status,
        progressMode: values.progressMode,
        startDate: values.startDate || undefined,
        targetDate: values.targetDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsRoadmapModalOpen(false);
    },
  });

  const toggleRoadmapStatusMutation = useMutation({
    mutationFn: (newStatus: RoadmapStatus) => {
      if (!roadmapId) throw new Error('Missing roadmap ID');
      return api.roadmaps.update(roadmapId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteRoadmapMutation = useMutation({
    mutationFn: () => {
      if (!roadmapId) throw new Error('Missing roadmap ID');
      return api.roadmaps.delete(roadmapId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/learning');
    },
  });

  // Topic mutations
  const createTopicMutation = useMutation({
    mutationFn: (values: TopicFormValues) => {
      if (!roadmapId) throw new Error('Missing roadmap ID');
      return api.topics.create(roadmapId, {
        title: values.title,
        description: values.description,
        weight: values.weight,
        startDate: values.startDate || undefined,
        targetDate: values.targetDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsTopicModalOpen(false);
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TopicFormValues }) => {
      return api.topics.update(id, {
        title: values.title,
        description: values.description,
        weight: values.weight,
        status: values.status,
        startDate: values.startDate || undefined,
        targetDate: values.targetDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditingTopic(null);
    },
  });

  const updateTopicStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TopicStatus }) => {
      return api.topics.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const reorderTopicsMutation = useMutation({
    mutationFn: (newOrderIds: string[]) => {
      if (!roadmapId) throw new Error('Missing roadmap ID');
      return api.topics.reorder(roadmapId, newOrderIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (id: string) => api.topics.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeletingTopicId(null);
    },
  });

  const moveTopic = (index: number, direction: 'UP' | 'DOWN') => {
    if (
      (direction === 'UP' && index === 0) ||
      (direction === 'DOWN' && index === topics.length - 1)
    ) {
      return;
    }

    const newTopics = [...topics];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const temp = newTopics[index];
    newTopics[index] = newTopics[targetIndex];
    newTopics[targetIndex] = temp;

    const newOrderIds = newTopics.map((t) => t.id);
    reorderTopicsMutation.mutate(newOrderIds);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-44 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Roadmap not found</h3>
        <p className="text-xs text-slate-500 mb-6">
          The requested learning roadmap does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/learning')}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Back to Roadmaps
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/learning')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmaps
        </button>

        {/* Roadmap Actions */}
        <div className="flex items-center gap-2">
          {roadmap.status === 'COMPLETED' ? (
            <button
              onClick={() => toggleRoadmapStatusMutation.mutate('ACTIVE')}
              disabled={toggleRoadmapStatusMutation.isPending}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Reopen Roadmap
            </button>
          ) : (
            <button
              onClick={() => toggleRoadmapStatusMutation.mutate('COMPLETED')}
              disabled={toggleRoadmapStatusMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Completed
            </button>
          )}

          <button
            onClick={() => setIsRoadmapModalOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            title="Edit Roadmap Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDeletingRoadmap(true)}
            className="p-2 text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete Roadmap"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Progress Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  roadmap.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : roadmap.status === 'COMPLETED'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {roadmap.status === 'ACTIVE' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {roadmap.status}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                Mode: {roadmap.progressMode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {roadmap.name}
            </h1>
            <p className="text-sm text-slate-500 max-w-3xl">
              {roadmap.description || 'No detailed roadmap description provided.'}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 min-w-[200px] text-center md:text-right space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Curriculum Progress
            </div>
            <div className="text-3xl font-black text-slate-900">
              {(roadmap.progressPercentage ?? 0).toFixed(1)}%
            </div>
            <div className="text-xs font-medium text-slate-600">
              {roadmap.completedTopics} of {roadmap.totalTopics} topics completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                roadmap.progressPercentage >= 100
                  ? 'bg-emerald-500'
                  : roadmap.progressPercentage > 50
                  ? 'bg-brand-600'
                  : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(100, roadmap.progressPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Started: {roadmap.startDate || 'Unspecified'}</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Target: {roadmap.targetDate || 'No deadline'}
                {roadmap.daysRemaining != null && (
                  <span
                    className={`ml-1.5 font-semibold ${
                      roadmap.isOverdue
                        ? 'text-rose-600'
                        : roadmap.daysRemaining === 0
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    ({roadmap.isOverdue ? `Overdue by ${Math.abs(roadmap.daysRemaining)}d` : `${roadmap.daysRemaining}d left`})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum & Topics Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">Topics & Curriculum</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {topics.length}
            </span>
          </div>

          <button
            onClick={() => {
              setEditingTopic(null);
              setIsTopicModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>

        {/* Empty topics state */}
        {topics.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">No topics added yet</h4>
            <p className="text-xs text-slate-500 mb-4">
              Add your first learning topic (e.g. ArrayList, HashMap, or Binary Trees) to begin tracking your progress.
            </p>
            <button
              onClick={() => {
                setEditingTopic(null);
                setIsTopicModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Topic
            </button>
          </div>
        )}

        {/* Topics List */}
        {topics.length > 0 && (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <TopicRowItem
                key={topic.id}
                topic={topic}
                index={index}
                totalTopics={topics.length}
                onMoveUp={() => moveTopic(index, 'UP')}
                onMoveDown={() => moveTopic(index, 'DOWN')}
                isReordering={reorderTopicsMutation.isPending}
                onEdit={() => setEditingTopic(topic)}
                onDelete={() => setDeletingTopicId(topic.id)}
                onStatusChange={(status) =>
                  updateTopicStatusMutation.mutate({ id: topic.id, status })
                }
                workspaceId={roadmap.workspaceId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Topic Confirmation */}
      {deletingTopicId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Delete Topic?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this topic? Progress for this roadmap will be automatically recalculated.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingTopicId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTopicMutation.mutate(deletingTopicId)}
                disabled={deleteTopicMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                {deleteTopicMutation.isPending ? 'Deleting...' : 'Delete Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Roadmap Confirmation */}
      {isDeletingRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Delete Roadmap?</h4>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete <span className="font-semibold text-slate-800">'{roadmap.name}'</span>? All attached topics and progress will be lost.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsDeletingRoadmap(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRoadmapMutation.mutate()}
                disabled={deleteRoadmapMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                {deleteRoadmapMutation.isPending ? 'Deleting...' : 'Delete Roadmap'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Create / Edit Modal */}
      {(isTopicModalOpen || editingTopic) && (
        <TopicModal
          isOpen={isTopicModalOpen || !!editingTopic}
          onClose={() => {
            setIsTopicModalOpen(false);
            setEditingTopic(null);
          }}
          onSubmit={async (values) => {
            if (editingTopic) {
              await updateTopicMutation.mutateAsync({ id: editingTopic.id, values });
            } else {
              await createTopicMutation.mutateAsync(values);
            }
          }}
          initialData={editingTopic}
          roadmapTitle={roadmap.name}
        />
      )}

      {/* Edit Roadmap Modal */}
      {isRoadmapModalOpen && (
        <RoadmapModal
          isOpen={isRoadmapModalOpen}
          onClose={() => setIsRoadmapModalOpen(false)}
          onSubmit={async (values) => {
            await updateRoadmapMutation.mutateAsync(values);
          }}
          initialData={roadmap}
          workspaceId={roadmap.workspaceId}
        />
      )}
    </div>
  );
}
