import React from 'react';
import { Briefcase, CalendarCheck, Clock, Award, Bell } from 'lucide-react';
import { JobStatsSummary } from '../../../lib/api';

interface JobStatsBarProps {
  stats?: JobStatsSummary;
  isLoading: boolean;
}

export const JobStatsBar: React.FC<JobStatsBarProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      {/* 1: Total Applications */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Total Tracked</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xs">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.totalApplications ?? 0
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Across all stages</span>
        </div>
      </div>

      {/* 2: Applied This Month */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>This Month</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-2xs">
            <CalendarCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.appliedThisMonth ?? 0
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          <span>Recent submissions</span>
        </div>
      </div>

      {/* 3: Active Interviews */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Active Pipeline</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white shadow-2xs">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.activeInterviews ?? 0
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span>In interview rounds</span>
        </div>
      </div>

      {/* 4: Offers */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Offers & Wins</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xs">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-600">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.offersCount ?? 0
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Job offers secured</span>
        </div>
      </div>

      {/* 5: Follow-ups Due */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs col-span-2 sm:col-span-1 transition-all hover:border-slate-300 hover:shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Follow-ups</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xs">
            <Bell className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isLoading ? (
              <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
            ) : (
              stats?.followUpsDue ?? 0
            )}
          </span>
          <span className="text-xs text-slate-400">due</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>Action items pending</span>
        </div>
      </div>
    </div>
  );
};
