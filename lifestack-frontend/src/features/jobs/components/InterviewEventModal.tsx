import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Award, AlertCircle } from 'lucide-react';
import {
  InterviewEvent,
  InterviewEventType,
  InterviewStatus,
  InterviewResult,
  CreateInterviewPayload,
  UpdateInterviewPayload,
} from '../../../lib/api';

export interface InterviewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateInterviewPayload | UpdateInterviewPayload) => Promise<void>;
  initialData?: InterviewEvent | null;
  companyName?: string;
}

const EVENT_TYPE_OPTIONS: { label: string; value: InterviewEventType }[] = [
  { label: 'Recruiter Screening', value: 'RECRUITER_SCREEN' },
  { label: 'Technical / Live Coding', value: 'TECHNICAL' },
  { label: 'System Design Architecture', value: 'SYSTEM_DESIGN' },
  { label: 'Behavioral / Leadership', value: 'BEHAVIORAL' },
  { label: 'Managerial Fit', value: 'MANAGERIAL' },
  { label: 'Final Round / Onsite', value: 'FINAL_ROUND' },
  { label: 'Other Assessment', value: 'OTHER' },
];

const STATUS_OPTIONS: { label: string; value: InterviewStatus }[] = [
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rescheduled', value: 'RESCHEDULED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const RESULT_OPTIONS: { label: string; value: InterviewResult }[] = [
  { label: 'Pending / Awaiting Feedback', value: 'PENDING' },
  { label: 'Passed / Next Round', value: 'PASSED' },
  { label: 'Failed / Rejected', value: 'FAILED' },
];

function toLocalDatetimeString(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoString(datetimeLocal: string): string | undefined {
  if (!datetimeLocal) return undefined;
  const d = new Date(datetimeLocal);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export const InterviewEventModal: React.FC<InterviewEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  companyName,
}) => {
  const isEditing = Boolean(initialData);

  const [roundName, setRoundName] = useState('');
  const [eventType, setEventType] = useState<InterviewEventType>('TECHNICAL');
  const [scheduledAt, setScheduledAt] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [status, setStatus] = useState<InterviewStatus>('SCHEDULED');
  const [result, setResult] = useState<InterviewResult>('PENDING');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setRoundName(initialData.roundName || '');
      setEventType(initialData.eventType || 'TECHNICAL');
      setScheduledAt(toLocalDatetimeString(initialData.scheduledAt));
      setOccurredAt(toLocalDatetimeString(initialData.occurredAt));
      setStatus(initialData.status || 'SCHEDULED');
      setResult(initialData.result || 'PENDING');
      setNotes(initialData.notes || '');
    } else {
      setRoundName('');
      setEventType('TECHNICAL');
      // Default scheduledAt to tomorrow at 10:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setScheduledAt(toLocalDatetimeString(tomorrow.toISOString()));
      setOccurredAt('');
      setStatus('SCHEDULED');
      setResult('PENDING');
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName.trim()) {
      setErrorMessage('Round name is required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload: CreateInterviewPayload | UpdateInterviewPayload = {
        roundName: roundName.trim(),
        eventType,
        scheduledAt: toIsoString(scheduledAt),
        occurredAt: toIsoString(occurredAt),
        status,
        result,
        notes: notes.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save interview round');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Update Interview Round' : 'Schedule Interview Round'}
              </h2>
              <p className="text-xs text-slate-500">
                {companyName ? `For ${companyName}` : 'Log round timeline, questions, and outcomes.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Round Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Round 1: Live Coding & Algorithms"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as InterviewEventType)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InterviewStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Scheduled At</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Occurred At</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Round Outcome / Result</label>
            <div className="relative mt-1">
              <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as InterviewResult)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              >
                {RESULT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Interview Notes & Questions Asked</label>
            <textarea
              rows={3}
              placeholder="Interviewer names, coding problems asked, behavioral scenarios, feedback received..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Round' : 'Schedule Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
