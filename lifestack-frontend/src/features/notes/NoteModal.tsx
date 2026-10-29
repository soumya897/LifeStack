import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, FileText, Tag, AlertCircle } from 'lucide-react';
import { LifeStackLoader } from '../../components/LifeStackLoader';
import { Note } from '../../lib/api';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  content: z.string().optional(),
  tags: z.string().max(255, 'Tags string must be under 255 characters').optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: NoteFormValues) => Promise<void>;
  initialData?: Note | null;
  fixedTopicId?: string;
  fixedProblemId?: string;
}

export function NoteModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: NoteModalProps) {
  const isEditing = !!initialData;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (initialData) {
        reset({
          title: initialData.title || '',
          content: initialData.content || '',
          tags: initialData.tags || '',
        });
      } else {
        reset({
          title: '',
          content: '',
          tags: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (values: NoteFormValues) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save note. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Knowledge Note' : 'Create Note'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Capture explanations, key takeaways, diagrams, and tags.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {submitError && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Amortized Analysis & Dynamic Resizing"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                {...register('tags')}
                placeholder="e.g. dsa, arrays, amortized-time, complexity"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {errors.tags && (
                <p className="text-xs text-rose-500 mt-1">{errors.tags.message}</p>
              )}
            </div>

            {/* Content (Markdown / Text) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Note Content
              </label>
              <textarea
                {...register('content')}
                rows={9}
                placeholder="Write your study notes, insights, key points, code snippets, or interview checklist..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LifeStackLoader size="xs" className="mr-2" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
