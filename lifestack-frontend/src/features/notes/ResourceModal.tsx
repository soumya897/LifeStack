import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Link2 } from 'lucide-react';
import { LifeStackLoader } from '../../components/LifeStackLoader';

const resourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be under 255 characters'),
  url: z.string().url('Must be a valid URL (starting with http:// or https://)'),
  resourceType: z.string().max(50).optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ResourceFormValues) => Promise<void>;
}

const COMMON_TYPES = ['Documentation', 'Article', 'Video', 'Cheat Sheet', 'Official Docs', 'Book'];

export function ResourceModal({ isOpen, onClose, onSubmit }: ResourceModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: '',
      url: '',
      resourceType: 'Documentation',
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Learning Resource</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Save external documentation, guides, or video links.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
            reset();
          })}
          className="p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Resource Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Java ArrayList Official JavaDoc"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              URL Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              {...register('url')}
              placeholder="https://docs.oracle.com/en/java/javase/..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            {errors.url && <p className="text-xs text-rose-500 mt-1">{errors.url.message}</p>}
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Category / Type
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('resourceType', type)}
                  className="px-2 py-0.5 text-xs font-medium rounded-md border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-700"
                >
                  {type}
                </button>
              ))}
            </div>
            <input
              type="text"
              {...register('resourceType')}
              placeholder="e.g. Documentation, Video, Guide"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LifeStackLoader size="xs" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
