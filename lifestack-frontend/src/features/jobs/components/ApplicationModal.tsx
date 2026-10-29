import React, { useState, useEffect } from 'react';
import { X, Briefcase, Building, Globe, MapPin, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import {
  JobApplication,
  ApplicationStatus,
  WorkMode,
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from '../../../lib/api';

export interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateApplicationPayload | UpdateApplicationPayload) => Promise<void>;
  initialData?: JobApplication | null;
  workspaceId: string;
}

const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: 'Saved (Wishlist)', value: 'SAVED' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Recruiter Screening', value: 'SCREENING' },
  { label: 'Online Assessment', value: 'ASSESSMENT' },
  { label: 'Interviewing', value: 'INTERVIEW' },
  { label: 'Offer Received', value: 'OFFER' },
  { label: 'Hired / Accepted', value: 'HIRED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
  { label: 'On Hold', value: 'ON_HOLD' },
];

const WORK_MODE_OPTIONS: { label: string; value: WorkMode }[] = [
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'On-site', value: 'ONSITE' },
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  workspaceId,
}) => {
  const isEditing = Boolean(initialData);

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [source, setSource] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedAt, setAppliedAt] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('REMOTE');
  const [salary, setSalary] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName || '');
      setJobTitle(initialData.jobTitle || '');
      setStatus(initialData.status || 'APPLIED');
      setSource(initialData.source || '');
      setJobUrl(initialData.jobUrl || '');
      setAppliedAt(initialData.appliedAt || '');
      setLocation(initialData.location || '');
      setWorkMode(initialData.workMode || 'REMOTE');
      setSalary(initialData.salary || '');
      setFollowUpAt(initialData.followUpAt || '');
      setNotes(initialData.notes || '');
    } else {
      setCompanyName('');
      setJobTitle('');
      setStatus('APPLIED');
      setSource('');
      setJobUrl('');
      setAppliedAt(new Date().toISOString().split('T')[0]);
      setLocation('');
      setWorkMode('REMOTE');
      setSalary('');
      setFollowUpAt('');
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMessage('Company name is required.');
      return;
    }
    if (!jobTitle.trim()) {
      setErrorMessage('Job title is required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (isEditing) {
        const payload: UpdateApplicationPayload = {
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          status,
          source: source.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
          appliedAt: appliedAt || undefined,
          location: location.trim() || undefined,
          workMode,
          salary: salary.trim() || undefined,
          followUpAt: followUpAt || undefined,
          notes: notes.trim() || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: CreateApplicationPayload = {
          workspaceId,
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          status,
          source: source.trim() || undefined,
          jobUrl: jobUrl.trim() || undefined,
          appliedAt: appliedAt || undefined,
          location: location.trim() || undefined,
          workMode,
          salary: salary.trim() || undefined,
          followUpAt: followUpAt || undefined,
          notes: notes.trim() || undefined,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Job Application' : 'Track New Application'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update role details and recruitment stage.'
                  : 'Log a new opportunity in your career pipeline.'}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Google, Datadog"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Job Title / Role <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              >
                {WORK_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Source</label>
              <input
                type="text"
                placeholder="LinkedIn, Referral, Wellfound"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Location</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Salary / Range</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. $160k - $180k"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Job URL</label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://company.com/jobs/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Applied Date</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Follow-up Date</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={followUpAt}
                  onChange={(e) => setFollowUpAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Notes / Recruiter Info</label>
            <textarea
              rows={3}
              placeholder="Contacts, key requirements, hiring manager, tech stack details..."
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
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Track Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
