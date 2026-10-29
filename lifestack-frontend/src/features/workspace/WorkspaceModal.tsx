import React, { useState, useEffect } from 'react';
import { Workspace } from '@/lib/api';
import { X, FolderPlus, Edit3 } from 'lucide-react';
import { LifeStackLoader } from '@/components/LifeStackLoader';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceToEdit?: Workspace | null;
  onSave: (name: string, description?: string) => Promise<void>;
}

export function WorkspaceModal({ isOpen, onClose, workspaceToEdit, onSave }: WorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceToEdit) {
      setName(workspaceToEdit.name);
      setDescription(workspaceToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError(null);
  }, [workspaceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(name.trim(), description.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save workspace');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!workspaceToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              {isEdit ? <Edit3 className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Workspace' : 'Create New Workspace'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update workspace settings' : 'Organize a separate set of roadmaps and tasks'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master's Preparation, Coding Club"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the goals for this workspace..."
              rows={3}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting && <LifeStackLoader size="xs" />}
              <span>{isEdit ? 'Save Changes' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

