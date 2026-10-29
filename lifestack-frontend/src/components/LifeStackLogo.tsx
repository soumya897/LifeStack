import React from 'react';

interface LifeStackLogoProps {
  className?: string;
  size?: number | string;
  withBackground?: boolean;
}

export const LifeStackLogo: React.FC<LifeStackLogoProps> = ({
  className = "w-10 h-10",
  size,
  withBackground = false,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-label="LifeStack Logo"
      role="img"
    >
      <defs>
        <linearGradient id="ls-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c4a6e" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        <linearGradient id="ls-l-frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="ls-bar-1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="ls-bar-2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="ls-bar-3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {withBackground && (
        <rect width="512" height="512" rx="112" fill="url(#ls-bg)" />
      )}

      <g id="lifestack-mark">
        {/* L-Spine and Baseline */}
        <path
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
          fill="url(#ls-l-frame)"
        />

        {/* Milestone Steps */}
        <rect x="208" y="278" width="46" height="46" rx="10" fill="url(#ls-bar-1)" />
        <rect x="268" y="202" width="46" height="122" rx="10" fill="url(#ls-bar-2)" />
        <rect x="328" y="120" width="46" height="204" rx="10" fill="url(#ls-bar-3)" />
      </g>
    </svg>
  );
};
export default LifeStackLogo;
