import React from 'react';
import {
  Building2,
  User,
  Database,
  CheckCircle2,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useWorkspace } from '../workspace/WorkspaceContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace, workspaces } = useWorkspace();

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
    </div>
  );
};
