import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Building2,
  User,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useWorkspace } from '../workspace/WorkspaceContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace, workspaces } = useWorkspace();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          System Settings & Studio
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal workspace, account preferences, and configure tailored field templates.
        </p>
      </div>

      {/* Featured Milestone 7 Hero Banner: Customization Studio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 ring-1 ring-inset ring-purple-500/30 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Milestone 7 Active
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Customization Studio & Field Templates
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-purple-100/90 leading-relaxed">
            Design domain-specific data models with our dynamic schema engine. Configure custom fields
            across 9 types (URL, Email, Single/Multi-Select, Numeric Bounds, and Booleans) with immutable version branching.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/settings/templates')}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-purple-400 transition-colors"
            >
              <Sliders className="h-4 w-4" />
              Launch Customization Studio
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-10">
          <Layers className="h-44 w-44" />
        </div>
      </div>

      {/* Grid of Settings Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Custom Templates */}
        <div
          onClick={() => navigate('/settings/templates')}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            Custom Field Templates
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Manage template versions for Job Applications and Standalone Records. Add, reorder, and publish custom schema versions.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
            <span>Configure Studio</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Workspace Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Active Workspace</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            All career notes, roadmaps, job applications, and custom records are isolated within your active workspace.
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

        {/* Card 3: User Profile & Security */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Database Storage</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">PostgreSQL + JSONB</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Schema V5 Active
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Template Engine</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">Dynamic Schema & Versioning</span>
            <span className="text-[10px] text-purple-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> 9 Field Types Supported
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Immutability Engine</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">Audit-Safe Freeze</span>
            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Published Locking Active
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Auth Security</span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">JWT + Spring Security</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3" /> Multi-Tenant Row Security
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
