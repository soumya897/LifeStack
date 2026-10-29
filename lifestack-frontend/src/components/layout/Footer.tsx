import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { LifeStackLogo } from '@/components/LifeStackLogo';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-5 px-4 sm:px-6 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        {/* Left: Branding & Copyright */}
        <div className="flex items-center gap-2">
          <LifeStackLogo className="h-5 w-5 shrink-0" withBackground={false} />
          <span className="font-semibold text-slate-700">LifeStack</span>
          <span className="text-slate-300">&bull;</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {/* Center: Security Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Multi-Tenant Row-Level Security &bull; Argon2 + Stateless JWT</span>
        </div>

        {/* Right: Terms & Portfolio Links */}
        <div className="flex items-center gap-4 text-xs">
          <Link
            to="/terms"
            className="font-medium text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline transition-colors"
          >
            Terms & Conditions
          </Link>

          <span className="text-slate-300">&bull;</span>

          <a
            href="https://soumya-here.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline transition-colors"
            title="Visit Developer Portfolio"
          >
            <span>Crafted by Soumya</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

