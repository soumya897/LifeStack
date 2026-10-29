import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Code2,
  Copy,
  Check,
  Cpu,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { LifeStackLoader } from '../../components/LifeStackLoader';
import {
  api,
  Problem,
  ProblemSolution,
  ProblemStatus,
  ProblemDifficulty,
  Note,
  CreateSolutionPayload,
  UpdateSolutionPayload,
} from '../../lib/api';
import { SolutionModal } from './SolutionModal';
import { ProblemModal } from './ProblemModal';
import { NoteModal } from '../notes/NoteModal';
import { useWorkspace } from '../workspace/WorkspaceContext';

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

export function ProblemDetailPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();

  const [isEditProblemOpen, setIsEditProblemOpen] = useState(false);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState<ProblemSolution | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [copiedSolutionId, setCopiedSolutionId] = useState<string | null>(null);

  // Fetch Problem details
  const { data: problem, isLoading: isLoadingProblem } = useQuery<Problem>({
    queryKey: ['problem', problemId],
    queryFn: async () => {
      const res = await api.problems.get(problemId!);
      return res.data;
    },
    enabled: !!problemId,
  });

  // Fetch Solutions
  const { data: solutions = [], isLoading: isLoadingSolutions } = useQuery<ProblemSolution[]>({
    queryKey: ['problem-solutions', problemId],
    queryFn: async () => {
      const res = await api.solutions.list(problemId!);
      return res.data;
    },
    enabled: !!problemId,
  });

  // Fetch Linked Notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['problem-notes', problemId],
    queryFn: async () => {
      const res = await api.notes.listByProblem(problemId!);
      return res.data;
    },
    enabled: !!problemId,
  });

  // Update Problem Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: ProblemStatus) =>
      api.problems.update(problemId!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  // Delete Problem Mutation
  const deleteProblemMutation = useMutation({
    mutationFn: () => api.problems.delete(problemId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      navigate('/coding');
    },
  });

  // Create Solution Mutation
  const createSolutionMutation = useMutation({
    mutationFn: (payload: CreateSolutionPayload) => api.solutions.create(problemId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-solutions', problemId] });
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      setIsSolutionModalOpen(false);
    },
  });

  // Update Solution Mutation
  const updateSolutionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSolutionPayload }) =>
      api.solutions.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-solutions', problemId] });
      setIsSolutionModalOpen(false);
      setEditingSolution(null);
    },
  });

  // Delete Solution Mutation
  const deleteSolutionMutation = useMutation({
    mutationFn: (solutionId: string) => api.solutions.delete(solutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-solutions', problemId] });
      queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });

  // Unlink Note Mutation
  const unlinkNoteMutation = useMutation({
    mutationFn: (noteId: string) => api.notes.unlinkProblem(problemId!, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-notes', problemId] });
    },
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSolutionId(id);
    setTimeout(() => setCopiedSolutionId(null), 2000);
  };

  const handleOpenEditSolution = (solution: ProblemSolution) => {
    setEditingSolution(solution);
    setIsSolutionModalOpen(true);
  };

  const handleSaveSolution = async (values: CreateSolutionPayload) => {
    if (editingSolution) {
      await updateSolutionMutation.mutateAsync({
        id: editingSolution.id,
        payload: values,
      });
    } else {
      await createSolutionMutation.mutateAsync(values);
    }
  };

  const handleUpdateProblem = async (values: {
    title: string;
    statement?: string;
    difficulty: ProblemDifficulty;
    platformUrl?: string;
    status?: ProblemStatus;
  }) => {
    await api.problems.update(problemId!, values);
    queryClient.invalidateQueries({ queryKey: ['problem', problemId] });
    queryClient.invalidateQueries({ queryKey: ['problems'] });
    setIsEditProblemOpen(false);
  };

  const handleDeleteProblem = () => {
    if (window.confirm('Are you sure you want to delete this problem and all its solutions?')) {
      deleteProblemMutation.mutate();
    }
  };

  if (isLoadingProblem) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LifeStackLoader size="lg" label="Loading problem details..." />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">Problem Not Found</h2>
        <p className="text-slate-500 mt-2">The requested coding problem could not be found.</p>
        <Link
          to="/coding"
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Coding Practice
        </Link>
      </div>
    );
  }

  const currentStatus = STATUS_CONFIG[problem.status] || STATUS_CONFIG.UNSOLVED;
  const currentDiff = DIFFICULTY_CONFIG[problem.difficulty] || DIFFICULTY_CONFIG.MEDIUM;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500">
          <Link to="/coding" className="hover:text-slate-800 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Coding Practice
          </Link>
          {problem.roadmapId && (
            <>
              <span>/</span>
              <Link
                to={`/learning/${problem.roadmapId}`}
                className="hover:text-slate-800 font-medium truncate max-w-[120px] sm:max-w-[150px]"
              >
                {problem.roadmapName}
              </Link>
            </>
          )}
          {problem.topicTitle && (
            <>
              <span>/</span>
              <span className="text-slate-700 font-semibold truncate max-w-[120px] sm:max-w-[150px]">
                {problem.topicTitle}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditProblemOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Edit Problem
          </button>
          <button
            onClick={handleDeleteProblem}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Problem Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentDiff.bg} ${currentDiff.text} ${currentDiff.border}`}
              >
                {currentDiff.label}
              </span>

              {/* Status Switcher Dropdown */}
              <div className="inline-flex items-center">
                <select
                  value={problem.status}
                  onChange={(e) => updateStatusMutation.mutate(e.target.value as ProblemStatus)}
                  className={`text-xs font-bold rounded-full px-2.5 py-0.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                >
                  <option value="UNSOLVED">Unsolved</option>
                  <option value="ATTEMPTED">Attempted</option>
                  <option value="SOLVED">Solved</option>
                  <option value="MASTERED">Mastered</option>
                </select>
              </div>

              {problem.platformUrl && (
                <a
                  href={problem.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1 text-slate-500" />
                  View on Platform
                </a>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{problem.title}</h1>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Logged {new Date(problem.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="flex items-center font-medium text-slate-600">
                <Code2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {solutions.length} solution{solutions.length !== 1 ? 's' : ''} recorded
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingSolution(null);
              setIsSolutionModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 active:scale-95 transition-all self-start lg:self-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Solution
          </button>
        </div>

        {/* Problem Statement */}
        {problem.statement && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Problem Statement / Requirements
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-4 rounded-xl border border-slate-100 font-sans">
              {problem.statement}
            </div>
          </div>
        )}
      </div>

      {/* Solutions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Solutions</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
              {solutions.length}
            </span>
          </div>

          {solutions.length > 0 && (
            <button
              onClick={() => {
                setEditingSolution(null);
                setIsSolutionModalOpen(true);
              }}
              className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Another Approach
            </button>
          )}
        </div>

        {isLoadingSolutions ? (
          <LifeStackLoader size="md" center label="Loading solutions..." />
        ) : solutions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No solutions recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save your implementation, complexity analysis, and approach. Adding a solution will
              automatically mark this problem as Solved!
            </p>
            <button
              onClick={() => {
                setEditingSolution(null);
                setIsSolutionModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Record First Solution
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {solutions.map((sol, index) => (
              <div
                key={sol.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Solution Header */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                      {sol.language}
                    </span>
                    {sol.timeComplexity && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        <Cpu className="w-3 h-3 mr-1 text-blue-500" />
                        Time: {sol.timeComplexity}
                      </span>
                    )}
                    {sol.spaceComplexity && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        <Cpu className="w-3 h-3 mr-1 text-purple-500" />
                        Space: {sol.spaceComplexity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyCode(sol.code, sol.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Copy code"
                    >
                      {copiedSolutionId === sol.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditSolution(sol)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Edit solution"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this solution?')) {
                          deleteSolutionMutation.mutate(sol.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete solution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Approach */}
                {sol.approach && (
                  <div className="px-5 py-3 border-b border-slate-100 bg-amber-50/20 text-xs text-slate-700">
                    <strong className="text-slate-900 font-semibold">Approach: </strong>
                    {sol.approach}
                  </div>
                )}

                {/* Code Body */}
                <div className="relative">
                  <pre className="p-5 text-xs font-mono bg-slate-900 text-slate-100 overflow-x-auto leading-relaxed">
                    <code>{sol.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Notes Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Linked Notes</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
              {notes.length}
            </span>
          </div>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Note for Problem
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200/80 text-center">
            <p className="text-xs text-slate-500">
              No notes linked to this problem yet. Add a note to capture algorithm patterns, tricky
              edge cases, or interview reminders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note: Note) => (
              <div
                key={note.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center">
                      <FileText className="w-4 h-4 mr-1.5 text-indigo-500" />
                      {note.title}
                    </h4>
                    <button
                      onClick={() => unlinkNoteMutation.mutate(note.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Unlink note from problem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {note.content && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                  )}
                </div>

                {note.tags && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100">
                    {note.tags.split(',').map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-700"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SolutionModal
        isOpen={isSolutionModalOpen}
        onClose={() => {
          setIsSolutionModalOpen(false);
          setEditingSolution(null);
        }}
        onSubmit={handleSaveSolution}
        initialData={editingSolution}
      />

      <ProblemModal
        isOpen={isEditProblemOpen}
        onClose={() => setIsEditProblemOpen(false)}
        onSubmit={handleUpdateProblem}
        initialData={problem}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={async (values) => {
          if (!currentWorkspace?.id) return;
          await api.notes.create({
            workspaceId: currentWorkspace.id,
            title: values.title,
            content: values.content,
            tags: values.tags,
            problemId: problem.id,
          });
          queryClient.invalidateQueries({ queryKey: ['problem-notes', problemId] });
          setIsNoteModalOpen(false);
        }}
        fixedProblemId={problem.id}
      />
    </div>
  );
}
