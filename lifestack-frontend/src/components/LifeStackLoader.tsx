import React, { useId } from 'react';

export interface LifeStackLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  label?: string;
  center?: boolean;
  fullScreen?: boolean;
}

const SIZE_MAP = {
  xs: 16,
  sm: 24,
  md: 40,
  lg: 64,
  xl: 80,
};

export const LifeStackLoader: React.FC<LifeStackLoaderProps> = ({
  size = 'xl',
  className = '',
  label,
  center = false,
  fullScreen = false,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const frameId = `load-l-frame-${id}`;
  const bar1Id = `load-bar-1-${id}`;
  const bar2Id = `load-bar-2-${id}`;
  const bar3Id = `load-bar-3-${id}`;

  const dimension = typeof size === 'number' ? size : SIZE_MAP[size] ?? 80;
  const isCompact = dimension <= 32;

  const svgContent = (
    <div className={`lifestack-loader-container shrink-0 ${className}`}>
      <svg
        className={`lifestack-loader-svg ${isCompact ? 'lifestack-loader-svg-compact' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={dimension}
        height={dimension}
        role="status"
        aria-label={label || 'Loading LifeStack...'}
      >
        <defs>
          <linearGradient id={frameId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id={bar1Id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id={bar2Id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id={bar3Id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Outer 'L' Frame */}
        <path
          className="l-spine"
          d="M 128 120 
             C 128 115.58 131.58 112 136 112 
             L 180 112 
             C 184.42 112 188 115.58 188 120 
             L 188 340 
             L 376 340 
             C 380.42 340 384 343.58 384 348 
             L 384 392 
             C 384 396.42 380.42 400 376 400 
             L 144 400 
             C 135.16 400 128 392.84 128 384 
             Z"
          fill={`url(#${frameId})`}
        />

        {/* Milestone Step 1 (Low) */}
        <rect className="bar step-1" x="208" y="278" width="46" height="46" rx="10" fill={`url(#${bar1Id})`} />

        {/* Milestone Step 2 (Medium) */}
        <rect className="bar step-2" x="268" y="202" width="46" height="122" rx="10" fill={`url(#${bar2Id})`} />

        {/* Milestone Step 3 (High) */}
        <rect className="bar step-3" x="328" y="120" width="46" height="204" rx="10" fill={`url(#${bar3Id})`} />
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xs">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
          {svgContent}
          {label && <p className="text-sm font-semibold text-slate-700 animate-pulse">{label}</p>}
        </div>
      </div>
    );
  }

  if (center || label) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 w-full">
        {svgContent}
        {label && <p className="text-xs font-semibold text-slate-500 tracking-wide">{label}</p>}
      </div>
    );
  }

  return svgContent;
};

export default LifeStackLoader;

