import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Code2, Cpu } from 'lucide-react';
import { LifeStackLoader } from '../../components/LifeStackLoader';
import { ProblemSolution } from '../../lib/api';

const solutionSchema = z.object({
  language: z.string().min(1, 'Language is required').max(50, 'Language must be under 50 characters'),
  code: z.string().min(1, 'Solution code cannot be blank'),
  approach: z.string().optional(),
  timeComplexity: z.string().max(50, 'Time complexity must be under 50 characters').optional(),
  spaceComplexity: z.string().max(50, 'Space complexity must be under 50 characters').optional(),
});

type SolutionFormValues = z.infer<typeof solutionSchema>;

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  initialData?: ProblemSolution | null;
}

const COMMON_LANGUAGES = ['Java', 'Python', 'TypeScript', 'JavaScript', 'C++', 'Go', 'Rust', 'C#', 'Kotlin', 'SQL'];
const COMMON_COMPLEXITIES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];

export function SolutionModal({ isOpen, onClose, onSubmit, initialData }: SolutionModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      language: 'Java',
      code: '',
      approach: '',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          language: initialData.language || 'Java',
          code: initialData.code || '',
          approach: initialData.approach || '',
          timeComplexity: initialData.timeComplexity || '',
          spaceComplexity: initialData.spaceComplexity || '',
        });
      } else {
        reset({
          language: 'Java',
          code: '',
          approach: '',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Solution' : 'Record Solution'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Save implementation code, Big-O metrics, and reasoning.
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Language <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setValue('language', lang)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <input
                type="text"
                {...register('language')}
                placeholder="e.g. Java, Python, TypeScript"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {errors.language && (
                <p className="text-xs text-rose-500 mt-1">{errors.language.message}</p>
              )}
            </div>

            {/* Time & Space Complexity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  <Cpu className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Time Complexity
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {COMMON_COMPLEXITIES.slice(0, 4).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('timeComplexity', c)}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  {...register('timeComplexity')}
                  placeholder="e.g. O(n log n)"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {errors.timeComplexity && (
                  <p className="text-xs text-rose-500 mt-1">{errors.timeComplexity.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  <Cpu className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Space Complexity
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {COMMON_COMPLEXITIES.slice(0, 3).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('spaceComplexity', c)}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  {...register('spaceComplexity')}
                  placeholder="e.g. O(1)"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {errors.spaceComplexity && (
                  <p className="text-xs text-rose-500 mt-1">{errors.spaceComplexity.message}</p>
                )}
              </div>
            </div>

            {/* Approach */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Approach & Intuition
              </label>
              <textarea
                {...register('approach')}
                rows={2}
                placeholder="Briefly describe the algorithm, pattern, or mathematical idea (e.g., Two Pointers with slow/fast pointers)..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Solution Code <span className="text-rose-500">*</span>
              </label>
              <textarea
                {...register('code')}
                rows={9}
                placeholder="// Paste or write solution code here..."
                className="w-full px-4 py-3 text-xs sm:text-sm font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all leading-relaxed"
                spellCheck={false}
              />
              {errors.code && (
                <p className="text-xs text-rose-500 mt-1">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LifeStackLoader size="xs" className="mr-2" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Save Solution'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
