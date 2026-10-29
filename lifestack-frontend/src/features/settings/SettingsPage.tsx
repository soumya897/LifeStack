import React, { useState } from 'react';
import {
  Building2,
  User,
  Database,
  CheckCircle2,
  ShieldCheck,
  Server,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import { LifeStackLoader } from '@/components/LifeStackLoader';

export const SettingsPage: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { currentWorkspace, workspaces } = useWorkspace();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          System Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal workspace and account preferences.
        </p>
      </div>

      {/* Grid of Settings Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Workspace Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Active Workspace</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            All career notes, roadmaps, coding problems, and job applications are strictly isolated within your active workspace.
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Name:</span>
              <span className="font-semibold text-slate-800">{currentWorkspace?.name || 'Default Workspace'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Workspaces:</span>
              <span className="font-semibold text-slate-800">{workspaces.length}</span>
            </div>
          </div>
        </div>

        {/* Card 2: User Profile & Security */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <User className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">User Profile</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Authenticated via stateless JWT session with Argon2 password hashing and multi-tenant isolation.
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">User:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{user?.displayName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-400" />
          Architecture & Platform Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Database Storage</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">PostgreSQL + Flyway</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Schema Migrations Active
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Backend Framework</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">Spring Boot 3 + Java 21</span>
            <span className="text-[10px] text-brand-600 font-medium flex items-center gap-1 mt-1">
              <Server className="h-3 w-3" /> RESTful Architecture
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Auth Security</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">JWT + Spring Security</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ShieldCheck className="h-3 w-3" /> Multi-Tenant Row Security
            </span>
          </div>
        </div>
      </div>
      {/* Danger Zone: Account Deletion */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-900 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-600" />
              Danger Zone: Delete Account
            </h3>
            <p className="mt-1 text-xs text-red-700 leading-relaxed max-w-xl">
              Permanently delete your account (<span className="font-semibold">{user?.email}</span>) and all associated workspaces, learning roadmaps, coding bank problems, job application trackers, and schedules.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="p-2 rounded-xl bg-red-50 border border-red-100">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Account</h3>
                  <p className="text-xs text-slate-500">Permanent Action</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Are you sure you want to delete your account for{' '}
                <strong className="text-slate-900">{user?.email}</strong>?
              </p>
              <p className="text-red-600 font-medium bg-red-50/80 p-2.5 rounded-lg border border-red-100">
                This action is irreversible. All your workspaces, learning roadmaps, coding bank problems, job application trackers, notes, and alerts will be permanently erased.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <LifeStackLoader size="xs" />
                    <span>Deleting account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
