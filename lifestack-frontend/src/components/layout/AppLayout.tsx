import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Compass,
  Code2,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  Layers,
  Menu,
  X,
  Server,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const navigationItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Today', to: '/today', icon: CalendarCheck },
  { name: 'Learning & Roadmaps', to: '/learning', icon: Compass },
  { name: 'Coding Practice', to: '/coding', icon: Code2 },
  { name: 'Notes', to: '/notes', icon: FileText },
  { name: 'Job Tracker', to: '/jobs', icon: Briefcase },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.health.check(),
    refetchInterval: 30000,
  });

  const isHealthy = healthData?.data?.status === 'UP';

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
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
                      ? 'bg-brand-50 text-brand-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer — System Status */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs border border-slate-200/60">
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-600">Backend API</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isLoading ? (
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
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Workspace /</span>
              <span className="text-sm font-semibold text-slate-800">Personal Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Milestone 1 Foundation
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
