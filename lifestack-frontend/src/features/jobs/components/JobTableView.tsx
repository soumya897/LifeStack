import React from 'react';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../../../lib/api';
import { WorkModeBadge } from './JobStatusBadge';

interface JobTableViewProps {
  applications: JobApplication[];
  onSelect: (app: JobApplication) => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
  onStatusChange: (app: JobApplication, newStatus: ApplicationStatus) => void;
  isLoading: boolean;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
  'ON_HOLD',
];

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

export const JobTableView: React.FC<JobTableViewProps> = ({
  applications,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading,
}) => {
  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <p className="mt-3 text-xs font-medium text-slate-500">Loading job applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Briefcase className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-slate-800">No applications found</h3>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your search filters or track a new application.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Company & Role</th>
              <th className="py-3.5 px-4">Stage / Status</th>
              <th className="py-3.5 px-4">Mode & Location</th>
              <th className="py-3.5 px-4">Applied</th>
              <th className="py-3.5 px-4">Follow-up</th>
              <th className="py-3.5 px-4">Interviews</th>
              <th className="py-3.5 px-4">Salary</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {applications.map((app) => {
              const isFollowUpDue = app.followUpAt && app.followUpAt <= today;
              const initial = app.companyName ? app.companyName.charAt(0).toUpperCase() : '?';
              const avatarGrad = getCompanyAvatarBg(app.companyName || 'Company');

              return (
                <tr
                  key={app.id}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => onSelect(app)}
                >
                  {/* Company & Role */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${avatarGrad} text-xs font-extrabold text-white shadow-2xs`}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                          <span className="truncate">{app.companyName}</span>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-brand-600 p-0.5"
                              title="Open job listing link"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                          <span className="truncate">{app.jobTitle}</span>
                          {app.source && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                              {app.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={app.status}
                      onChange={(e) => onStatusChange(app, e.target.value as ApplicationStatus)}
                      className={`rounded-lg border border-slate-200 py-1 px-2.5 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-500 cursor-pointer ${
                        app.status === 'OFFER' || app.status === 'HIRED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : app.status === 'INTERVIEW'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : app.status === 'APPLIED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-white text-slate-700'
                      }`}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Mode & Location */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <WorkModeBadge mode={app.workMode} />
                      {app.location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[140px]">
                          <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                          {app.location}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {app.appliedAt ? (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {app.appliedAt}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Follow-up Date */}
                  <td className="py-3.5 px-4">
                    {app.followUpAt ? (
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          isFollowUpDue ? 'text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200' : 'text-slate-600'
                        }`}
                      >
                        {isFollowUpDue && <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 animate-pulse" />}
                        {app.followUpAt}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Rounds Count */}
                  <td className="py-3.5 px-4">
                    {app.interviewRoundsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-100">
                        <Clock className="h-3 w-3" />
                        {app.interviewRoundsCount} {app.interviewRoundsCount === 1 ? 'round' : 'rounds'}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {app.salary ? (
                      <span className="inline-flex items-center gap-0.5 font-medium text-slate-700">
                        <DollarSign className="h-3 w-3 text-emerald-600" />
                        {app.salary}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onEdit(app)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit application"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(app)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onSelect(app)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                        title="View details"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
