import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Topic, TopicStatus } from '../../lib/api';

const topicSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must be under 200 characters'),
  description: z.string().optional(),
  weight: z.number().min(1, 'Weight must be at least 1'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVISING']).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TopicFormValues) => Promise<void>;
  initialData?: Topic | null;
  roadmapTitle?: string;
}

export function TopicModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  roadmapTitle,
}: TopicModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: '',
      description: '',
      weight: 1,
      status: 'NOT_STARTED',
      startDate: '',
      targetDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description || '',
          weight: initialData.weight || 1,
          status: initialData.status,
          startDate: initialData.startDate || '',
          targetDate: initialData.targetDate || '',
        });
      } else {
        reset({
          title: '',
          description: '',
          weight: 1,
          status: 'NOT_STARTED',
          startDate: new Date().toISOString().split('T')[0],
          targetDate: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Topic' : 'Add Topic to Roadmap'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {roadmapTitle ? `Belongs to: ${roadmapTitle}` : 'Break down your roadmap into actionable learning milestones.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Topic Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g. ArrayLists, Binary Search, Red-Black Trees"
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

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes / Subtopics
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Key concepts, complexity trade-offs, or syllabus notes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Relative Weight
              </label>
              <input
                {...register('weight', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Used for weighted roadmap progress.</p>
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
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REVISING">Revising</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Date
              </label>
              <input
                {...register('startDate')}
                type="date"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Deadline
              </label>
              <input
                {...register('targetDate')}
                type="date"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
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
              <span>{isEditing ? 'Save Changes' : 'Add Topic'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { TopicFormValues, TopicStatus };

