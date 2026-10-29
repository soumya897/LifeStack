import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../../../lib/api';
import { WorkModeBadge } from './JobStatusBadge';

interface JobKanbanViewProps {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
  onStatusChange: (app: JobApplication, newStatus: ApplicationStatus) => void;
  isLoading: boolean;
}

interface ColumnDef {
  key: string;
  title: string;
  shortTitle: string;
  statuses: ApplicationStatus[];
  color: string;
  headerBg: string;
  badgeBg: string;
  accentBorder: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'saved',
    title: 'Wishlist & Saved',
    shortTitle: 'Saved',
    statuses: ['SAVED'],
    color: 'text-slate-700',
    headerBg: 'bg-slate-100/80',
    badgeBg: 'bg-slate-200 text-slate-800',
    accentBorder: 'border-t-slate-400',
  },
  {
    key: 'applied',
    title: 'Applied',
    shortTitle: 'Applied',
    statuses: ['APPLIED'],
    color: 'text-blue-700',
    headerBg: 'bg-blue-50/80',
    badgeBg: 'bg-blue-200 text-blue-800',
    accentBorder: 'border-t-blue-500',
  },
  {
    key: 'screen_assess',
    title: 'Screening & Assessment',
    shortTitle: 'Screening',
    statuses: ['SCREENING', 'ASSESSMENT'],
    color: 'text-indigo-700',
    headerBg: 'bg-indigo-50/80',
    badgeBg: 'bg-indigo-200 text-indigo-800',
    accentBorder: 'border-t-indigo-500',
  },
  {
    key: 'interview',
    title: 'Interviewing',
    shortTitle: 'Interviewing',
    statuses: ['INTERVIEW'],
    color: 'text-purple-700',
    headerBg: 'bg-purple-50/80',
    badgeBg: 'bg-purple-200 text-purple-800',
    accentBorder: 'border-t-purple-500',
  },
  {
    key: 'offer_hired',
    title: 'Offers & Hired',
    shortTitle: 'Offers',
    statuses: ['OFFER', 'HIRED'],
    color: 'text-emerald-700',
    headerBg: 'bg-emerald-50/80',
    badgeBg: 'bg-emerald-200 text-emerald-800',
    accentBorder: 'border-t-emerald-500',
  },
  {
    key: 'archived',
    title: 'Inactive & Closed',
    shortTitle: 'Inactive',
    statuses: ['REJECTED', 'WITHDRAWN', 'ON_HOLD'],
    color: 'text-rose-700',
    headerBg: 'bg-rose-50/80',
    badgeBg: 'bg-rose-200 text-rose-800',
    accentBorder: 'border-t-rose-400',
  },
];

const STAGE_ORDER: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'HIRED',
];

// Helper to generate consistent gradient company avatars
const getCompanyAvatarBg = (name: string) => {
  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-violet-600',
    'from-emerald-600 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-600 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export const JobKanbanView: React.FC<JobKanbanViewProps> = ({
  applications,
  onSelect,
  onStatusChange,
  isLoading,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [stageScope, setStageScope] = useState<'all' | 'active' | 'interview' | 'offers'>('all');

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading pipeline board...</p>
      </div>
    );
  }

  const getNextStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
      return STAGE_ORDER[idx + 1];
    }
    return null;
  };

  const getPrevStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx > 0) {
      return STAGE_ORDER[idx - 1];
    }
    return null;
  };

  // Filter columns based on user's quick stage scope
  const filteredColumns = COLUMNS.filter((col) => {
    if (stageScope === 'active') {
      return col.key !== 'archived';
    }
    if (stageScope === 'interview') {
      return col.key === 'screen_assess' || col.key === 'interview';
    }
    if (stageScope === 'offers') {
      return col.key === 'offer_hired';
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Modern Stage Scope Filter Bar (Quick access without horizontal scrolling) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Stage Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStageScope('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              stageScope === 'all'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All Columns ({applications.length})
          </button>
          <button
            onClick={() => setStageScope('active')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              stageScope === 'active'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Active Pipeline ({applications.filter((a) => !['REJECTED', 'WITHDRAWN', 'ON_HOLD'].includes(a.status)).length})
          </button>
          <button
            onClick={() => setStageScope('interview')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              stageScope === 'interview'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Interviews ({applications.filter((a) => ['SCREENING', 'ASSESSMENT', 'INTERVIEW'].includes(a.status)).length})
          </button>
          <button
            onClick={() => setStageScope('offers')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              stageScope === 'offers'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Offers & Wins ({applications.filter((a) => ['OFFER', 'HIRED'].includes(a.status)).length})
          </button>
        </div>
      </div>

      {/* Modern Responsive Kanban Grid: Fits cleanly on screen without forced horizontal scrolling */}
      <div
        className={`grid gap-3.5 ${
          filteredColumns.length === 1
            ? 'grid-cols-1 max-w-xl mx-auto'
            : filteredColumns.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : filteredColumns.length <= 4
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : filteredColumns.length === 5
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'
        }`}
      >
        {filteredColumns.map((col) => {
          const columnApps = applications.filter((app) => col.statuses.includes(app.status));

          return (
            <div
              key={col.key}
              className={`flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-2xs overflow-hidden border-t-4 ${col.accentBorder} transition-all`}
            >
              {/* Modern Column Header */}
              <div className={`flex items-center justify-between border-b border-slate-200/70 px-3.5 py-2.5 ${col.headerBg}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold tracking-tight ${col.color}`}>
                    {col.shortTitle}
                  </span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${col.badgeBg}`}>
                  {columnApps.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-2.5 p-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[160px]">
                {columnApps.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/50 p-4 text-center">
                    <span className="text-[11px] font-medium text-slate-400">No applications</span>
                  </div>
                ) : (
                  columnApps.map((app) => {
                    const isFollowUpDue = app.followUpAt && app.followUpAt <= today;
                    const nextStatus = getNextStatus(app.status);
                    const prevStatus = getPrevStatus(app.status);
                    const initial = app.companyName ? app.companyName.charAt(0).toUpperCase() : '?';
                    const avatarGrad = getCompanyAvatarBg(app.companyName || 'Company');

                    return (
                      <div
                        key={app.id}
                        onClick={() => onSelect(app)}
                        className="group relative rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                      >
                        {/* Company Logo/Initial & Title */}
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${avatarGrad} text-xs font-extrabold text-white shadow-2xs`}
                          >
                            {initial}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-xs truncate">
                                {app.companyName}
                              </h4>
                              {app.jobUrl && (
                                <a
                                  href={app.jobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-400 hover:text-brand-600 p-0.5 shrink-0"
                                  title="Open job listing link"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 mt-0.5 truncate">
                              {app.jobTitle}
                            </p>
                          </div>
                        </div>

                        {/* Badges: Work Mode & Location */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <WorkModeBadge mode={app.workMode} />
                          {app.location && (
                            <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium truncate max-w-[120px]">
                              <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              {app.location}
                            </span>
                          )}
                          {app.salary && (
                            <span className="inline-flex items-center gap-0.5 font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.2">
                              <DollarSign className="h-2.5 w-2.5 text-emerald-600" />
                              {app.salary}
                            </span>
                          )}
                        </div>

                        {/* Key Dates & Indicators */}
                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                          {app.appliedAt ? (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                              <Calendar className="h-2.5 w-2.5 text-slate-400" />
                              {app.appliedAt}
                            </span>
                          ) : (
                            <span className="text-slate-400">No date</span>
                          )}

                          {isFollowUpDue && (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              <AlertTriangle className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
                              Due
                            </span>
                          )}

                          {app.interviewRoundsCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-100">
                              <Clock className="h-2.5 w-2.5" />
                              {app.interviewRoundsCount} rnd
                            </span>
                          )}
                        </div>

                        {/* Modern Stage Progression Quick Flow Controls */}
                        <div
                          className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStatus ? (
                            <button
                              onClick={() => onStatusChange(app, prevStatus)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-700 py-1 px-1.5 rounded-md hover:bg-slate-100 transition-colors"
                              title={`Move back to ${prevStatus}`}
                            >
                              <ChevronLeft className="h-3 w-3" />
                              <span>Prev</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          {nextStatus ? (
                            <button
                              onClick={() => onStatusChange(app, nextStatus)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-700 hover:text-brand-900 py-1 px-2 rounded-md bg-brand-50 hover:bg-brand-100 border border-brand-200/60 transition-colors"
                              title={`Advance to ${nextStatus}`}
                            >
                              <span>Advance</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="h-3 w-3" /> Top Stage
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
