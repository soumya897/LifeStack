import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Code2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Loader2,
  Compass,
} from 'lucide-react';
import {
  api,
  Problem,
  ProblemDifficulty,
  ProblemStatus,
  Roadmap,
} from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { ProblemModal } from './ProblemModal';

const STATUS_CONFIG: Record<
  ProblemStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  UNSOLVED: { label: 'Unsolved', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  ATTEMPTED: { label: 'Attempted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  SOLVED: { label: 'Solved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MASTERED: { label: 'Mastered', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const DIFFICULTY_CONFIG: Record<
  ProblemDifficulty,
  { label: string; bg: string; text: string; border: string }
> = {
  EASY: { label: 'Easy', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  HARD: { label: 'Hard', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export function CodingPracticePage() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ProblemDifficulty | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  // Fetch Problems in workspace
  const { data: problems = [], isLoading } = useQuery<Problem[]>({
    queryKey: ['problems', currentWorkspace?.id, selectedStatus, selectedDifficulty],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const diffParam = selectedDifficulty === 'ALL' ? undefined : selectedDifficulty;
      const res = await api.problems.list(currentWorkspace.id, statusParam, diffParam);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch Roadmaps & Topics for the Create Problem modal
  const { data: roadmaps = [] } = useQuery<Roadmap[]>({
    queryKey: ['roadmaps', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.roadmaps.list(currentWorkspace.id);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch detail for roadmaps to get all available topics for dropdown
  const { data: topicOptions = [] } = useQuery({
    queryKey: ['all-topics-for-workspace', roadmaps.map((r) => r.id).join(',')],
    queryFn: async () => {
      const allTopics: { id: string; title: string; roadmapName: string }[] = [];
      for (const r of roadmaps) {
        try {
          const detailRes = await api.roadmaps.get(r.id);
          const detail = detailRes.data;
          if (detail.topics) {
            for (const t of detail.topics) {
              allTopics.push({
                id: t.id,
                title: t.title,
                roadmapName: r.name,
              });
            }
          }
        } catch {
          // ignore error fetching single roadmap
        }
      }
      return allTopics;
    },
    enabled: roadmaps.length > 0,
  });

  // Quick Status Update
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProblemStatus }) =>
      api.problems.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  // Delete Problem
  const deleteProblemMutation = useMutation({
    mutationFn: (id: string) => api.problems.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  // Filter problems locally by search
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.statement && p.statement.toLowerCase().includes(search.toLowerCase())) ||
        (p.topicTitle && p.topicTitle.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [problems, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const solvedOrMastered = problems.filter(
      (p) => p.status === 'SOLVED' || p.status === 'MASTERED'
    ).length;
    const easy = problems.filter((p) => p.difficulty === 'EASY').length;
    const medium = problems.filter((p) => p.difficulty === 'MEDIUM').length;
    const hard = problems.filter((p) => p.difficulty === 'HARD').length;
    const rate = total > 0 ? Math.round((solvedOrMastered / total) * 100) : 0;
    return { total, solvedOrMastered, easy, medium, hard, rate };
  }, [problems]);

  const handleOpenCreate = () => {
    setEditingProblem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (problem: Problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleSaveProblem = async (values: {
    title: string;
    statement?: string;
    difficulty: ProblemDifficulty;
    platformUrl?: string;
    status?: ProblemStatus;
    topicId?: string;
  }) => {
    if (editingProblem) {
      await api.problems.update(editingProblem.id, {
        title: values.title,
        statement: values.statement,
        difficulty: values.difficulty,
        platformUrl: values.platformUrl,
        status: values.status,
      });
    } else {
      const topicId = values.topicId || topicOptions[0]?.id;
      if (!topicId) {
        alert('Please create at least one topic in a roadmap first before adding problems.');
        return;
      }
      await api.problems.create(topicId, {
        title: values.title,
        statement: values.statement,
        difficulty: values.difficulty,
        platformUrl: values.platformUrl,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['problems'] });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-7 h-7 text-emerald-600" />
            Coding Practice
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Solve algorithm challenges, track complexity, and reinforce pattern mastery across your
            learning roadmaps.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-500/20 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Problem
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Recorded</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solved / Mastered</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-emerald-600">{stats.solvedOrMastered}</p>
            <span className="text-xs font-semibold text-slate-500">({stats.rate}%)</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Easy</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.easy}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Medium</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.medium}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Hard</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.hard}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems, topics, statements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  selectedDifficulty === diff
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff === 'ALL' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-2">Status:</span>
          {(['ALL', 'UNSOLVED', 'ATTEMPTED', 'SOLVED', 'MASTERED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading coding problems...</p>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No problems found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {problems.length === 0
              ? 'Start tracking your coding practice! Create challenges linked to topics on your learning roadmaps.'
              : 'No problems match your current search or filter criteria.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Record a Problem
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredProblems.map((problem) => {
              const diff = DIFFICULTY_CONFIG[problem.difficulty] || DIFFICULTY_CONFIG.MEDIUM;
              const statusCfg = STATUS_CONFIG[problem.status] || STATUS_CONFIG.UNSOLVED;

              return (
                <div
                  key={problem.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
                      >
                        {diff.label}
                      </span>

                      {/* Quick status selector */}
                      <select
                        value={problem.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: problem.id,
                            status: e.target.value as ProblemStatus,
                          })
                        }
                        className={`text-[11px] font-bold rounded-md px-2 py-0.5 border cursor-pointer focus:outline-none ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <option value="UNSOLVED">Unsolved</option>
                        <option value="ATTEMPTED">Attempted</option>
                        <option value="SOLVED">Solved</option>
                        <option value="MASTERED">Mastered</option>
                      </select>

                      {problem.solutionsCount > 0 ? (
                        <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          {problem.solutionsCount} solution{problem.solutionsCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          0 solutions
                        </span>
                      )}

                      {problem.platformUrl && (
                        <a
                          href={problem.platformUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Open external platform link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <Link
                      to={`/coding/${problem.id}`}
                      className="block text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate"
                    >
                      {problem.title}
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {problem.roadmapName && (
                        <span className="flex items-center font-medium text-slate-600 truncate max-w-[180px]">
                          <Compass className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {problem.roadmapName}
                        </span>
                      )}
                      {problem.topicTitle && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 font-medium truncate max-w-[180px]">
                            {problem.topicTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <Link
                      to={`/coding/${problem.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Solutions & Notes
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(problem)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Problem"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this coding problem?')) {
                          deleteProblemMutation.mutate(problem.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Problem Modal */}
      <ProblemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProblem(null);
        }}
        onSubmit={handleSaveProblem}
        initialData={editingProblem}
        topicOptions={topicOptions}
      />
    </div>
  );
}
