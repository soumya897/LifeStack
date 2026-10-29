import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BellRing,
  Compass,
  Code2,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  Menu,
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Plus,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { WorkspaceModal } from '@/features/workspace/WorkspaceModal';
import { PwaInstallPrompt, PwaInstallHeaderButton, PwaInstallSidebarItem } from '@/components/pwa/PwaInstallPrompt';
import { LifeStackLogo } from '@/components/LifeStackLogo';
import { useScheduleAlerts } from '@/features/schedule/useScheduleAlerts';
import { ScheduleAlertModal } from '@/features/schedule/ScheduleAlertModal';

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Schedule & Alerts', to: '/schedule', icon: BellRing },
  { name: 'Learning & Roadmaps', to: '/learning', icon: Compass },
  { name: 'Coding Practice', to: '/coding', icon: Code2 },
  { name: 'Notes', to: '/notes', icon: FileText },
  { name: 'Job Tracker', to: '/jobs', icon: Briefcase },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, updateWorkspace, deleteWorkspace } =
    useWorkspace();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { activeAlert, dismissAlert } = useScheduleAlerts();

  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.health.check(),
    refetchInterval: 30000,
  });

  // Close workspace dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleOpenCreateWorkspace = () => {
    setEditMode(false);
    setWorkspaceMenuOpen(false);
    setModalOpen(true);
  };

  const handleOpenEditWorkspace = () => {
    setEditMode(true);
    setWorkspaceMenuOpen(false);
    setModalOpen(true);
  };

  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (workspaces.length <= 1) {
      alert('Cannot delete your only workspace.');
      return;
    }
    if (confirm(`Are you sure you want to delete workspace "${name}"? This action cannot be undone.`)) {
      try {
        await deleteWorkspace(id);
        setWorkspaceMenuOpen(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        }
      }
    }
  };

  const isHealthy = healthData?.data?.status === 'UP';

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xs transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <LifeStackLogo className="h-9 w-9 shrink-0 drop-shadow-xs" withBackground={true} />
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">LifeStack</span>
              <span className="block text-[10px] font-semibold tracking-wider text-brand-600 uppercase">
                Productivity OS
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <PwaInstallSidebarItem />
        </nav>

        {/* Sidebar Footer — System Status & User Profile */}
        <div className="border-t border-slate-100 p-4 space-y-3">
          {user && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-200/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-xs">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">{user.displayName}</p>
                  <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-red-600 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs border border-slate-200/60">
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-600">Backend API</span>
            </div>
            <div className="flex items-center gap-1.5">
              {healthLoading ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              ) : isHealthy ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-emerald-700">Online</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-semibold text-amber-700">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Interactive Workspace Switcher Dropdown */}
            <div className="relative" ref={workspaceDropdownRef}>
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span className="text-slate-400 hidden xs:inline">Workspace:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[200px]">
                  {currentWorkspace?.name || 'Personal Workspace'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {workspaceMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Workspace
                  </div>
                  <div className="space-y-1">
                    {workspaces.map((ws) => {
                      const isActive = ws.id === currentWorkspace?.id;
                      return (
                        <div
                          key={ws.id}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-brand-50 font-semibold text-brand-800'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                          onClick={() => {
                            setCurrentWorkspace(ws);
                            setWorkspaceMenuOpen(false);
                          }}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate">{ws.name}</p>
                            {ws.description && (
                              <p className="truncate text-[10px] text-slate-400 font-normal">{ws.description}</p>
                            )}
                          </div>
                          {isActive && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                    <button
                      onClick={handleOpenCreateWorkspace}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create New Workspace</span>
                    </button>

                    {currentWorkspace && (
                      <button
                        onClick={handleOpenEditWorkspace}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>Edit Current Workspace</span>
                      </button>
                    )}

                    {currentWorkspace && workspaces.length > 1 && (
                      <button
                        onClick={() => handleDeleteWorkspace(currentWorkspace.id, currentWorkspace.name)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        <span>Delete Current Workspace</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PwaInstallHeaderButton />
            {user && (
              <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 px-2 sm:pl-2.5 sm:pr-3 text-xs">
                <UserIcon className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                <span className="font-medium text-slate-700 hidden sm:inline truncate max-w-[120px]">{user.displayName}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Workspace Create / Edit Modal */}
      <WorkspaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        workspaceToEdit={editMode ? currentWorkspace : null}
        onSave={async (name, desc) => {
          if (editMode && currentWorkspace) {
            await updateWorkspace(currentWorkspace.id, name, desc);
          } else {
            await createWorkspace(name, desc);
          }
        }}
      />

      {/* PWA Install Floating Prompt */}
      <PwaInstallPrompt />

      {/* Real-time Schedule Audio & Visual Alert Modal */}
      <ScheduleAlertModal alert={activeAlert} onClose={dismissAlert} />
    </div>
  );
}
