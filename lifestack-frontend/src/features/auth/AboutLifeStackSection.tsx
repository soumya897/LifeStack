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

export const AboutLifeStackSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'purpose' | 'features' | 'guide'>('purpose');

  return (
    <div className="flex flex-col space-y-6">
      {/* Brand & Purpose Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 shadow-2xs">
          <LifeStackLogo className="h-4 w-4" withBackground={false} />
          <span>Productivity & Career OS for Software Engineers</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Master Skills. Solve Algorithms.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            Land Your Dream Role.
          </span>
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
          <strong>LifeStack</strong> is a unified personal productivity platform engineered for developers. 
          Stop juggling disconnected notes, spreadsheets, and calendar reminders. Track structured learning curricula, 
          record algorithm solutions with complexity notes, manage your job application pipeline on Kanban, and stay on schedule with audio alerts.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('purpose')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'purpose'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          What is LifeStack?
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'features'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Core Pillars
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'guide'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          How to Use It
        </button>
      </div>

      {/* TAB 1: What is LifeStack & Purpose */}
      {activeTab === 'purpose' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-brand-50/30 p-5 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              The Purpose Behind LifeStack
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Preparing for technical interviews and mastering modern software engineering requires sustained focus across multiple disciplines. 
              LifeStack brings all four pillars into one unified workspace:
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-brand-700 font-bold">
                  <Compass className="h-4 w-4" />
                  <span>Curriculum Roadmaps</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Break down vast subjects (DSA, System Design, Spring Boot) into modular, sequenced topics with timeline health tracking.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Code2 className="h-4 w-4" />
                  <span>Coding Bank</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Save your algorithm patterns, solution approaches, and Big-O complexity logs ($O(N)$, $O(\log N)$) organized by roadmap topics.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-purple-700 font-bold">
                  <Briefcase className="h-4 w-4" />
                  <span>Recruitment Kanban</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Visualize your entire career pipeline across recruitment milestones with round notes and offer conversion metrics.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <BellRing className="h-4 w-4" />
                  <span>Schedule & Audio Alarms</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Set date and time alerts with synthesized chime audio notifications so you never miss an interview, OA, or study session.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Architecture Promise */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Multi-Tenant Isolation & Zero Cross-Leakage</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-brand-600" />
                Roadmaps & Syllabus Progress
              </span>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Visual Tracker
              </span>
            </div>

            {/* Mockup Illustration */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Data Structures & Algorithms</span>
                <span className="font-bold text-brand-600">75% Complete</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full w-3/4 transition-all" />
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3" /> 18 Topics Mastered
                </span>
                <span>&bull; Target: Nov 15</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card 2: Recruitment Kanban */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-purple-600" />
                Job Pipeline Kanban Board
              </span>
              <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                6 Recruitment Stages
              </span>
            </div>

            {/* Mini Kanban Columns Mockup */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                <span className="font-bold text-slate-600 block">Applied</span>
                <div className="bg-white rounded p-1 shadow-2xs border border-slate-100 text-left font-medium text-slate-800">
                  Google &bull; SWE II
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2 space-y-1">
                <span className="font-bold text-blue-700 block">Interview</span>
                <div className="bg-white rounded p-1 shadow-2xs border border-blue-100 text-left font-medium text-slate-800">
                  Stripe &bull; Backend
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2 space-y-1">
                <span className="font-bold text-emerald-700 block">Offer</span>
                <div className="bg-white rounded p-1 shadow-2xs border border-emerald-100 text-left font-bold text-emerald-700">
                  Offer Received! 🎉
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card 3: Audio Alerts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-brand-600" />
                Audio Chime Reminders
              </span>
              <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                Synthesized Web Audio
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">System Design Mock Interview</div>
                  <div className="text-[11px] text-slate-500">Tomorrow at 10:00 AM &bull; Sound On</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">
                High Priority
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: How to Use It (Step-by-step Workflow) */}
      {activeTab === 'guide' && (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">How to Use LifeStack (In 3 Simple Steps)</h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xs shadow-2xs">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Organize with Curricula & Roadmaps</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
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
                  <h4 className="text-xs font-bold text-slate-900">Solve Problems & Document Approaches</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    In the Coding Practice section, log algorithms with difficulty levels, LeetCode URLs, code implementations, 
                    and time/space complexity notes ($O(N)$ Big-O).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-xs shadow-2xs">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Track Applications & Set Audio Alerts</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
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
