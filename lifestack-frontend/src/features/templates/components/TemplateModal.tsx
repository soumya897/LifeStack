import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';
import {
  Template,
  TemplateRecordType,
  CreateTemplatePayload,
  UpdateTemplatePayload,
} from '../../../lib/api';

export interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTemplatePayload | UpdateTemplatePayload) => Promise<void>;
  initialData?: Template | null;
  workspaceId: string;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  workspaceId,
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState<TemplateRecordType>('JOB_APPLICATION');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setRecordType(initialData.recordType || 'JOB_APPLICATION');
    } else {
      setName('');
      setDescription('');
      setRecordType('JOB_APPLICATION');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Template name is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isEditing) {
        const payload: UpdateTemplatePayload = {
          name: name.trim(),
          description: description.trim() || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: CreateTemplatePayload = {
          workspaceId,
          name: name.trim(),
          description: description.trim() || undefined,
          recordType,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Template' : 'New Custom Template'}
              </h2>
              <p className="text-xs text-slate-500">
                Define a versioned schema of custom fields.
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

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Software Engineer Application Tracker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Module</label>
            <select
              disabled={isEditing}
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as TemplateRecordType)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
            >
              <option value="JOB_APPLICATION">Job Application (Career Pipeline)</option>
              <option value="CUSTOM_RECORD">Custom Standalone Records</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              {recordType === 'JOB_APPLICATION'
                ? 'Fields will be available to attach to job applications in this workspace.'
                : 'Generic schema for user-defined records.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Purpose of this schema, notes, or usage instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

