import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, BellRing, Calendar, Volume2, Sparkles } from 'lucide-react';
import { LifeStackLoader } from '@/components/LifeStackLoader';
import { ScheduleItem } from '@/lib/api';
import { playNotificationChime } from '@/lib/audioNotifier';

const scheduleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().optional(),
  itemType: z.enum(['TASK', 'TOPIC', 'ROADMAP', 'JOB_APPLICATION', 'CUSTOM_ALERT']),
  targetName: z.string().max(200).optional(),
  scheduledAt: z.string().min(1, 'Date and time are required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  soundEnabled: z.boolean(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => Promise<void>;
  initialData?: ScheduleItem | null;
}

export function ScheduleModal({ isOpen, onClose, onSubmit, initialData }: ScheduleModalProps) {
  const isEditing = !!initialData;
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Default to today + 1 hour formatted as YYYY-MM-DDTHH:mm
  const getDefaultDateTime = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: '',
      description: '',
      itemType: 'TASK',
      targetName: '',
      scheduledAt: getDefaultDateTime(),
      priority: 'MEDIUM',
      soundEnabled: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      if (initialData) {
        // Format ISO string to local input value
        const d = new Date(initialData.scheduledAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        const localFormatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        reset({
          title: initialData.title,
          description: initialData.description || '',
          itemType: initialData.itemType,
          targetName: initialData.targetName || '',
          scheduledAt: localFormatted,
          priority: initialData.priority,
          soundEnabled: initialData.soundEnabled,
        });
      } else {
        reset({
          title: '',
          description: '',
          itemType: 'TASK',
          targetName: '',
          scheduledAt: getDefaultDateTime(),
          priority: 'MEDIUM',
          soundEnabled: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = async (values: ScheduleFormValues) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save schedule alert. Please try again.');
    }
  };

  const selectedType = watch('itemType');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <BellRing className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Schedule & Alert' : 'Create Schedule & Alert'}
              </h3>
              <p className="text-xs text-slate-500">
                Set date, time, sound notification, and link to roadmap or job.
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
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {submitError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {submitError}
              </div>
            )}

            {/* Category / Item Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Schedule Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'TASK', label: 'Action Task' },
                  { value: 'TOPIC', label: 'Study Topic' },
                  { value: 'ROADMAP', label: 'Roadmap Milestone' },
                  { value: 'JOB_APPLICATION', label: 'Job / Interview' },
                  { value: 'CUSTOM_ALERT', label: 'Custom Alarm' },
                ].map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                      selectedType === cat.value
                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs ring-1 ring-brand-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={cat.value}
                      {...register('itemType')}
                      className="sr-only"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Alert Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Mock Interview with Amazon, Study Graphs DFS/BFS, Follow up"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Linked Entity / Context (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Linked Context / Reference (Optional)
              </label>
              <input
                type="text"
                {...register('targetName')}
                placeholder="e.g. DSA Roadmap, Google Application, Frontend Syllabus"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Date & Time Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Scheduled Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduledAt')}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800"
                />
                {errors.scheduledAt && (
                  <p className="text-xs text-rose-500 mt-1">{errors.scheduledAt.message}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alert Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent (Immediate Alarm)</option>
                </select>
              </div>
            </div>

            {/* Sound Notification Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-brand-600 shadow-2xs border border-slate-100">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Notification Sound</p>
                  <p className="text-[11px] text-slate-500">Play melodic audio chime when the alarm fires.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playNotificationChime()}
                  className="px-2.5 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                >
                  Test Sound
                </button>
                <input
                  type="checkbox"
                  {...register('soundEnabled')}
                  className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
              </div>
            </div>

            {/* Notes / Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Notes & Checklist (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Include key points to review, interview link, preparation goals, or instructions..."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LifeStackLoader size="xs" className="mr-2" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Create Schedule & Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
