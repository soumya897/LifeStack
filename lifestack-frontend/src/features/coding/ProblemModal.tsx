import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle, Code2 } from 'lucide-react';
import { Problem, ProblemDifficulty, ProblemStatus } from '../../lib/api';

const problemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must be under 255 characters'),
  statement: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  platformUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        try {
          const trimmed = val.trim();
          const toTest =
            trimmed.startsWith('http://') || trimmed.startsWith('https://')
              ? trimmed
              : `https://${trimmed}`;
          new URL(toTest);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid URL (e.g. https://leetcode.com/problems/...)' }
    ),
  status: z.enum(['UNSOLVED', 'ATTEMPTED', 'SOLVED', 'MASTERED']).optional(),
  topicId: z.string().optional(),
});

type ProblemFormValues = z.infer<typeof problemSchema>;

interface TopicOption {
  id: string;
  title: string;
  roadmapName: string;
}

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProblemFormValues) => Promise<void>;
  initialData?: Problem | null;
  fixedTopicId?: string;
  topicOptions?: TopicOption[];
}

export function ProblemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  fixedTopicId,
  topicOptions = [],
}: ProblemModalProps) {
  const isEditing = !!initialData;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProblemFormValues>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      statement: '',
      difficulty: 'MEDIUM',
      platformUrl: '',
      status: 'UNSOLVED',
      topicId: fixedTopicId || (topicOptions[0]?.id || ''),
    },
  });

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      if (initialData) {
        reset({
          title: initialData.title,
          statement: initialData.statement || '',
          difficulty: initialData.difficulty,
          platformUrl: initialData.platformUrl || '',
          status: initialData.status,
          topicId: initialData.topicId,
        });
      } else {
        reset({
          title: '',
          statement: '',
          difficulty: 'MEDIUM',
          platformUrl: '',
          status: 'UNSOLVED',
          topicId: fixedTopicId || (topicOptions[0]?.id || ''),
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: ProblemFormValues) => {
    try {
      setServerError(null);
      let formattedUrl = values.platformUrl?.trim();
      if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      await onSubmit({
        ...values,
        title: values.title.trim(),
        statement: values.statement?.trim() || undefined,
        platformUrl: formattedUrl || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Problem submission error:', err);
      setServerError(err.message || 'Failed to save coding problem. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Coding Problem' : 'Record Coding Problem'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track algorithm challenge statements, difficulty, and links.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 overflow-y-auto">
          {/* Topic Selector (if not fixed) */}
          {!fixedTopicId && topicOptions.length > 0 && !isEditing && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Topic <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('topicId')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {topicOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.roadmapName} → {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Problem Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              autoFocus
              placeholder="e.g. Two Sum, LRU Cache, Merge Intervals"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Difficulty
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Status (if editing) */}
            {isEditing && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="UNSOLVED">Unsolved</option>
                  <option value="ATTEMPTED">Attempted</option>
                  <option value="SOLVED">Solved</option>
                  <option value="MASTERED">Mastered</option>
                </select>
              </div>
            )}
          </div>

          {/* Platform URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Platform Link (Optional)
            </label>
            <input
              {...register('platformUrl')}
              type="text"
              placeholder="e.g. leetcode.com/problems/two-sum or https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {errors.platformUrl && (
              <p className="text-xs text-rose-500 mt-1">{errors.platformUrl.message}</p>
            )}
          </div>

          {/* Statement */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Problem Description / Constraints
            </label>
            <textarea
              {...register('statement')}
              rows={4}
              placeholder="Given an array of integers nums and an integer target..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Problem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { ProblemFormValues, ProblemDifficulty, ProblemStatus };
