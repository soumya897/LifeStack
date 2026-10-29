import React, { useState } from 'react';
import {
  Compass,
  Code2,
  Briefcase,
  BellRing,
  CheckCircle2,
  Clock,
  Volume2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { LifeStackLogo } from '@/components/LifeStackLogo';

interface AboutLifeStackSectionProps {
  isDark?: boolean;
}

export const AboutLifeStackSection: React.FC<AboutLifeStackSectionProps> = ({
  isDark = false,
}) => {
  const [activeTab, setActiveTab] = useState<'purpose' | 'features' | 'guide'>('purpose');

  return (
    <div className="flex flex-col space-y-6">
      {/* Brand & Purpose Header */}
      <div className="space-y-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-2xs border ${isDark
            ? 'bg-slate-800/90 border-slate-700/80 text-sky-400'
            : 'border-brand-200 bg-brand-50 text-brand-700'
            }`}
        >
          <LifeStackLogo className="h-4 w-4" withBackground={false} />
          <span>Productivity & Career OS for Software Engineers</span>
        </div>

        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'
            }`}
        >
          Master Skills. Solve Algorithms.{' '}
          <span
            className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark
              ? 'from-sky-400 via-blue-400 to-indigo-400'
              : 'from-brand-600 via-sky-600 to-indigo-600'
              }`}
          >
            Land Your Dream Role.
          </span>
        </h1>

        <p
          className={`text-sm sm:text-base leading-relaxed max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
        >
          <strong className={isDark ? 'text-white' : 'text-slate-900'}>LifeStack</strong> is a unified personal productivity platform engineered for developers.
          Stop juggling disconnected notes, spreadsheets, and calendar reminders. Track structured learning curricula,
          record algorithm solutions with complexity notes, manage your job application pipeline on Kanban, and stay on schedule with audio alerts.
        </p>
      </div>

      {/* Navigation Pills */}
      <div
        className={`flex items-center gap-2 border-b pb-2 overflow-x-auto text-xs font-semibold ${isDark ? 'border-slate-800' : 'border-slate-200/80'
          }`}
      >
        <button
          onClick={() => setActiveTab('purpose')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'purpose'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
            : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
        >
          What is LifeStack?
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'features'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
            : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
        >
          Core Pillars & Previews
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'guide'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
            : isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
        >
          How to Use It
        </button>
      </div>

      {/* TAB 1: What is LifeStack & Purpose */}
      {activeTab === 'purpose' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div
            className={`rounded-2xl border p-5 shadow-xs ${isDark
              ? 'border-slate-800 bg-slate-850/60 backdrop-blur-md'
              : 'border-brand-100 bg-white/95 backdrop-blur-md shadow-xs'
              }`}
          >
            <h3
              className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              <Zap className="h-5 w-5 text-amber-500" />
              The Purpose Behind LifeStack
            </h3>
            <p
              className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
            >
              Preparing for technical interviews and mastering modern software engineering requires sustained focus across multiple disciplines.
              LifeStack brings all four pillars into one unified workspace:
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs ${isDark
                  ? 'border-slate-750 bg-slate-800/80 text-slate-300 hover:border-slate-650'
                  : 'border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-brand-300'
                  }`}
              >
                <div
                  className={`flex items-center gap-2 font-bold ${isDark ? 'text-sky-400' : 'text-brand-600'
                    }`}
                >
                  <Compass className="h-4 w-4" />
                  <span>Curriculum Roadmaps</span>
                </div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Break down vast subjects (DSA, System Design, Spring Boot) into modular, sequenced topics with timeline health tracking.
                </p>
              </div>

              <div
                className={`rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs ${isDark
                  ? 'border-slate-750 bg-slate-800/80 text-slate-300 hover:border-slate-650'
                  : 'border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-emerald-300'
                  }`}
              >
                <div
                  className={`flex items-center gap-2 font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                >
                  <Code2 className="h-4 w-4" />
                  <span>Coding Bank</span>
                </div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Save your algorithm patterns, solution approaches, and Big-O complexity logs ($O(N)$, $O(\log N)$) organized by roadmap topics.
                </p>
              </div>

              <div
                className={`rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs ${isDark
                  ? 'border-slate-750 bg-slate-800/80 text-slate-300 hover:border-slate-650'
                  : 'border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-purple-300'
                  }`}
              >
                <div
                  className={`flex items-center gap-2 font-bold ${isDark ? 'text-purple-400' : 'text-indigo-600'
                    }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Recruitment Kanban</span>
                </div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visualize your entire career pipeline across recruitment milestones with round notes and offer conversion metrics.
                </p>
              </div>

              <div
                className={`rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs ${isDark
                  ? 'border-slate-750 bg-slate-800/80 text-slate-300 hover:border-slate-650'
                  : 'border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-rose-300'
                  }`}
              >
                <div
                  className={`flex items-center gap-2 font-bold ${isDark ? 'text-rose-400' : 'text-rose-600'
                    }`}
                >
                  <BellRing className="h-4 w-4" />
                  <span>Schedule & Audio Alarms</span>
                </div>
                <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Set date and time alerts with synthesized chime audio notifications so you never miss an interview, OA, or study session.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Architecture Promise */}
          <div
            className={`flex items-center gap-3 rounded-xl border p-3.5 text-xs ${isDark
              ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-200'
              : 'border-emerald-200 bg-emerald-50/70 text-emerald-900 shadow-2xs'
              }`}
          >
            <ShieldCheck
              className={`h-5 w-5 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
            />
            <div>
              <span className="font-bold">Multi-Tenant Isolation & Zero Cross-Leakage</span>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-emerald-300/80' : 'text-emerald-700'}`}>
                Every roadmap, note, coding solution, and job application is strictly scoped to your private workspace with cryptographic password hashing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Core Pillars & Visual Previews */}
      {activeTab === 'features' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Visual Showcase Card 1: Roadmaps & Coding */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 ${isDark
              ? 'border-slate-800 bg-slate-850/60 text-white'
              : 'border-brand-100 bg-white/95 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Compass
                  className={`h-4 w-4 ${isDark ? 'text-sky-400' : 'text-brand-600'}`}
                />
                Roadmaps & Syllabus Progress
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold border ${isDark
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
              >
                Visual Tracker
              </span>
            </div>

            {/* Mockup Illustration */}
            <div
              className={`rounded-xl border p-3.5 space-y-2.5 ${isDark ? 'border-slate-750 bg-slate-900/80' : 'border-slate-200 bg-slate-50/70'
                }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Data Structures & Algorithms</span>
                <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-brand-600'}`}>
                  75% Complete
                </span>
              </div>
              <div
                className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700/60' : 'bg-slate-200'
                  }`}
              >
                <div className="h-full bg-gradient-to-r from-brand-500 to-sky-400 rounded-full w-3/4 transition-all" />
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span
                  className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded border ${isDark
                    ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}
                >
                  <CheckCircle2 className="h-3 w-3" /> 18 Topics Mastered
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  &bull; Target: Nov 15
                </span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card 2: Recruitment Kanban */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 ${isDark
              ? 'border-slate-800 bg-slate-850/60 text-white'
              : 'border-brand-100 bg-white/95 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Briefcase
                  className={`h-4 w-4 ${isDark ? 'text-purple-400' : 'text-indigo-600'}`}
                />
                Job Pipeline Kanban Board
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold border ${isDark
                  ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
              >
                6 Recruitment Stages
              </span>
            </div>

            {/* Mini Kanban Columns Mockup */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div
                className={`rounded-lg border p-2 space-y-1 ${isDark ? 'border-slate-750 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
                  }`}
              >
                <span className={`font-bold block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Applied</span>
                <div
                  className={`rounded p-1 shadow-2xs text-left font-medium border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                >
                  Google &bull; SWE II
                </div>
              </div>
              <div
                className={`rounded-lg border p-2 space-y-1 ${isDark ? 'border-blue-900/60 bg-blue-950/40' : 'border-brand-200 bg-brand-50/60'
                  }`}
              >
                <span className={`font-bold block ${isDark ? 'text-blue-300' : 'text-brand-700'}`}>Interview</span>
                <div
                  className={`rounded p-1 shadow-2xs text-left font-medium border ${isDark ? 'bg-slate-800 border-blue-900 text-slate-200' : 'bg-white border-brand-200 text-slate-800'
                    }`}
                >
                  Stripe &bull; Backend
                </div>
              </div>
              <div
                className={`rounded-lg border p-2 space-y-1 ${isDark ? 'border-emerald-900/60 bg-emerald-950/40' : 'border-emerald-200 bg-emerald-50/60'
                  }`}
              >
                <span className={`font-bold block ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Offer</span>
                <div
                  className={`rounded p-1 shadow-2xs text-left font-bold border ${isDark ? 'bg-slate-800 border-emerald-900 text-emerald-300' : 'bg-white border-emerald-200 text-emerald-700'
                    }`}
                >
                  Offer Received!
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card 3: Audio Alerts */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 ${isDark
              ? 'border-slate-800 bg-slate-850/60 text-white'
              : 'border-brand-100 bg-white/95 text-slate-900'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Volume2
                  className={`h-4 w-4 ${isDark ? 'text-sky-400' : 'text-brand-600'}`}
                />
                Audio Chime Reminders
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold border ${isDark
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
              >
                Synthesized Web Audio
              </span>
            </div>

            <div
              className={`rounded-xl border p-3 flex items-center justify-between text-xs ${isDark ? 'border-slate-750 bg-slate-900/80' : 'border-slate-200 bg-slate-50/70'
                }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                    }`}
                >
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    System Design Mock Interview
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tomorrow at 10:00 AM &bull; Sound On
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-1 rounded-md border ${isDark
                  ? 'bg-sky-950/70 text-sky-300 border-sky-800/60'
                  : 'bg-brand-50 text-brand-700 border-brand-200'
                  }`}
              >
                High Priority
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: How to Use It (Step-by-step Workflow) */}
      {activeTab === 'guide' && (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          <div
            className={`rounded-2xl border p-5 shadow-xs space-y-4 ${isDark
              ? 'border-slate-800 bg-slate-850/60 text-white'
              : 'border-brand-100 bg-white/95 text-slate-900'
              }`}
          >
            <h3 className="text-sm font-bold">How to Use LifeStack (In 3 Simple Steps)</h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xs shadow-2xs">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold">Organize with Curricula & Roadmaps</h4>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Create a roadmap for your learning target (e.g. <em>LeetCode 75</em> or <em>Spring Boot Microservices</em>).
                    Add syllabus topics with target completion dates to monitor syllabus pacing.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold">Solve Problems & Document Approaches</h4>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    In the Coding Practice section, log algorithms with difficulty levels, LeetCode URLs, code implementations,
                    and time/space complexity notes ($O(N)$ Big-O).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-2xs">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold">Track Applications & Set Audio Alerts</h4>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Add job opportunities to your Kanban board. Move them across interview stages, record questions asked in each round,
                    and set alerts with audio alarms for scheduled dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
