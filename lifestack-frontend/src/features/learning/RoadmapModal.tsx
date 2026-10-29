import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { LifeStackLoader } from '../../components/LifeStackLoader';
import { Roadmap, ProgressMode, RoadmapStatus } from '../../lib/api';

const roadmapSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name must be under 150 characters'),
  description: z.string().optional(),
  progressMode: z.enum(['TOPIC', 'TASK', 'WEIGHTED']),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

type RoadmapFormValues = z.infer<typeof roadmapSchema>;

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RoadmapFormValues) => Promise<void>;
  initialData?: Roadmap | null;
  workspaceId: string;
}

export function RoadmapModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: RoadmapModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: {
      name: '',
      description: '',
      progressMode: 'TOPIC',
      status: 'ACTIVE',
      startDate: '',
      targetDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          progressMode: initialData.progressMode,
          status: initialData.status,
          startDate: initialData.startDate || '',
          targetDate: initialData.targetDate || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          progressMode: 'TOPIC',
          status: 'ACTIVE',
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Learning Roadmap' : 'Create New Roadmap'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update roadmap timeline, progress mode, or details.'
                : 'Define a new curriculum of topics and track mastery.'}
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Roadmap Name <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g. Data Structures & Algorithms, System Design"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Objectives
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="What core competencies will this roadmap cover?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Progress Mode */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Progress Mode
              </label>
              <select
                {...register('progressMode')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="TOPIC">Topic-based (Default)</option>
                <option value="WEIGHTED">Weighted Topics</option>
                <option value="TASK">Task-based</option>
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
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
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
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <LifeStackLoader size="xs" />}
              <span>{isEditing ? 'Save Changes' : 'Create Roadmap'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { RoadmapFormValues, ProgressMode, RoadmapStatus };

