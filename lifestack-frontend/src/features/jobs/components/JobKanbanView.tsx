import React from 'react';
import {
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  ExternalLink,
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
  statuses: ApplicationStatus[];
  color: string;
  borderTop: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'saved',
    title: 'Wishlist / Saved',
    statuses: ['SAVED'],
    color: 'bg-slate-100 text-slate-700',
    borderTop: 'border-t-slate-400',
  },
  {
    key: 'applied',
    title: 'Applied',
    statuses: ['APPLIED'],
    color: 'bg-blue-50 text-blue-700',
    borderTop: 'border-t-blue-500',
  },
  {
    key: 'screen_assess',
    title: 'Screening / Assessment',
    statuses: ['SCREENING', 'ASSESSMENT'],
    color: 'bg-indigo-50 text-indigo-700',
    borderTop: 'border-t-indigo-500',
  },
  {
    key: 'interview',
    title: 'Interviewing',
    statuses: ['INTERVIEW'],
    color: 'bg-purple-50 text-purple-700',
    borderTop: 'border-t-purple-500',
  },
  {
    key: 'offer_hired',
    title: 'Offer / Hired',
    statuses: ['OFFER', 'HIRED'],
    color: 'bg-emerald-50 text-emerald-700',
    borderTop: 'border-t-emerald-500',
  },
  {
    key: 'archived',
    title: 'Rejected / Inactive',
    statuses: ['REJECTED', 'WITHDRAWN', 'ON_HOLD'],
    color: 'bg-rose-50 text-rose-700',
    borderTop: 'border-t-rose-400',
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

export const JobKanbanView: React.FC<JobKanbanViewProps> = ({
  applications,
  onSelect,
  onStatusChange,
  isLoading,
}) => {
  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Loading pipeline board...</p>
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

  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => col.statuses.includes(app.status));

        return (
          <div
            key={col.key}
            className={`flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50/50 border-t-4 ${col.borderTop}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-3.5 py-3 rounded-t-lg">
              <span className="text-xs font-bold text-slate-800">{col.title}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${col.color}`}>
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3 p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {columnApps.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Empty
                </div>
              ) : (
                columnApps.map((app) => {
                  const isFollowUpDue = app.followUpAt && app.followUpAt <= today;
                  const nextStatus = getNextStatus(app.status);
                  const prevStatus = getPrevStatus(app.status);

                  return (
                    <div
                      key={app.id}
                      onClick={() => onSelect(app)}
                      className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all hover:border-brand-300 hover:shadow-xs cursor-pointer"
                    >
                      {/* Company & Role */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-xs">
                            {app.companyName}
                          </h4>
                          <p className="text-[11px] font-medium text-slate-600 mt-0.5 line-clamp-1">
                            {app.jobTitle}
                          </p>
                        </div>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-brand-600"
                            title="Job URL"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Mode & Location */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <WorkModeBadge mode={app.workMode} />
                        {app.salary && (
                          <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium">
                            <DollarSign className="h-3 w-3 text-slate-400" />
                            {app.salary}
                          </span>
                        )}
                      </div>

                      {/* Dates & Follow-ups */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                        {app.appliedAt ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {app.appliedAt}
                          </span>
                        ) : (
                          <span>Unspecified date</span>
                        )}

                        {isFollowUpDue && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                            Follow-up
                          </span>
                        )}

                        {app.interviewRoundsCount > 0 && (
                          <span className="rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                            {app.interviewRoundsCount} rnd
                          </span>
                        )}
                      </div>

                      {/* Stage Progression Quick Action Footer */}
                      <div
                        className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevStatus ? (
                          <button
                            onClick={() => onStatusChange(app, prevStatus)}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-700 py-0.5 px-1 rounded hover:bg-slate-100"
                            title={`Move back to ${prevStatus}`}
                          >
                            <ChevronLeft className="h-3 w-3" />
                            Prev
                          </button>
                        ) : (
                          <div />
                        )}

                        {nextStatus ? (
                          <button
                            onClick={() => onStatusChange(app, nextStatus)}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-600 hover:text-brand-800 py-0.5 px-1.5 rounded bg-brand-50 hover:bg-brand-100"
                            title={`Advance to ${nextStatus}`}
                          >
                            Advance
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <div />
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
  );
};
