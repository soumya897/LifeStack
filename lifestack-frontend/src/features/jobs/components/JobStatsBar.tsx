import React from 'react';
import { Briefcase, CalendarCheck, Clock, Award, Bell } from 'lucide-react';
import { JobStatsSummary } from '../../../lib/api';

interface JobStatsBarProps {
  stats?: JobStatsSummary;
  isLoading: boolean;
}

export const JobStatsBar: React.FC<JobStatsBarProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* 1: Total Applications */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Total Tracked</span>
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.totalApplications ?? 0
          )}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">All pipeline stages</div>
      </div>

      {/* 2: Applied This Month */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>This Month</span>
          <div className="rounded-lg bg-purple-50 p-1.5 text-purple-600">
            <CalendarCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.appliedThisMonth ?? 0
          )}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Applications submitted</div>
      </div>

      {/* 3: Active Interviews */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Active Interviews</span>
          <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.activeInterviews ?? 0
          )}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">In assessment or interview</div>
      </div>

      {/* 4: Offers */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Offers / Hired</span>
          <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-600">
          {isLoading ? (
            <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            stats?.offersCount ?? 0
          )}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Career wins</div>
      </div>

      {/* 5: Follow-ups Due */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Follow-ups Due</span>
          <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
            <Bell className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {isLoading ? (
              <span className="block h-7 w-12 animate-pulse rounded bg-slate-200" />
            ) : (
              stats?.followUpsDue ?? 0
            )}
          </span>
          {(stats?.followUpsDue ?? 0) > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              Needs action
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Scheduled on/before today</div>
      </div>
    </div>
  );
};
