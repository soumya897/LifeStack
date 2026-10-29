import React from 'react';
import {
  ApplicationStatus,
  WorkMode,
  InterviewStatus,
  InterviewResult,
  InterviewEventType,
} from '../../../lib/api';

export const ApplicationStatusBadge: React.FC<{ status: ApplicationStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-semibold';

  switch (status) {
    case 'SAVED':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          Saved
        </span>
      );
    case 'APPLIED':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          Applied
        </span>
      );
    case 'SCREENING':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 ${sizeClasses}`}>
          Screening
        </span>
      );
    case 'ASSESSMENT':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          Assessment
        </span>
      );
    case 'INTERVIEW':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          Interviewing
        </span>
      );
    case 'OFFER':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-400/20 ${sizeClasses}`}>
          🎉 Offer
        </span>
      );
    case 'HIRED':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-green-100 text-green-800 border border-green-300 ${sizeClasses}`}>
          ⭐ Hired
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          Rejected
        </span>
      );
    case 'WITHDRAWN':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          Withdrawn
        </span>
      );
    case 'ON_HOLD':
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>
          On Hold
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full font-medium bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const WorkModeBadge: React.FC<{ mode?: WorkMode }> = ({ mode }) => {
  if (!mode) return null;
  const config = {
    REMOTE: { label: 'Remote', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    HYBRID: { label: 'Hybrid', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    ONSITE: { label: 'On-site', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  }[mode] || { label: mode, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${config.bg}`}>
      {config.label}
    </span>
  );
};

export const InterviewResultBadge: React.FC<{ result: InterviewResult }> = ({ result }) => {
  switch (result) {
    case 'PASSED':
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          Passed
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
          Failed
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
          Pending
        </span>
      );
  }
};

export const InterviewStatusBadge: React.FC<{ status: InterviewStatus }> = ({ status }) => {
  switch (status) {
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
          Scheduled
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
          Completed
        </span>
      );
    case 'RESCHEDULED':
      return (
        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 border border-purple-200">
          Rescheduled
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
          Cancelled
        </span>
      );
  }
};

export const EventTypeLabel: React.FC<{ type: InterviewEventType }> = ({ type }) => {
  const map: Record<InterviewEventType, string> = {
    RECRUITER_SCREEN: 'Recruiter Screen',
    TECHNICAL: 'Technical / Live Code',
    SYSTEM_DESIGN: 'System Design',
    BEHAVIORAL: 'Behavioral Fit',
    MANAGERIAL: 'Managerial Fit',
    FINAL_ROUND: 'Final Round / Onsite',
    OTHER: 'Assessment / Other',
  };
  return <span>{map[type] || type}</span>;
};
