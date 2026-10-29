import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Server,
  Database,
  Clock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Lock,
  Unlock,
  Copy,
  Check,
  BarChart3,
  GitBranch,
  Plus,
  X,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, AdminUserItem } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { LifeStackLogo } from '@/components/LifeStackLogo';
import { LifeStackLoader } from '@/components/LifeStackLoader';

export function AdminDashboardPage() {
  const { user: currentAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'users' | 'health' | 'dau'>('users');

  // Filters & Pagination for User Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Auto-refresh interval (default 15 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Moderation confirmation modal state
  const [pendingBlockUser, setPendingBlockUser] = useState<AdminUserItem | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUserItem | null>(null);

  // Add Administrator modal state
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // 1. Fetch Admin Metrics (Live sessions, total users, DAU)
  const {
    data: metricsData,
    isLoading: metricsLoading,
    isRefetching: metricsRefetching,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.admin.getMetrics(),
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // 2. Fetch Backend System Health
  const {
    data: healthData,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => api.admin.getSystemHealth(),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // 3. Fetch User Directory (Paginated with search & status filters)
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['admin-users', page, pageSize, searchQuery, statusFilter],
    queryFn: () =>
      api.admin.getUsers({
        page,
        size: pageSize,
        search: searchQuery || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy: 'createdAt',
        direction: 'desc',
      }),
    refetchInterval: autoRefresh ? 20000 : false,
  });

  // Block User Mutation
  const blockMutation = useMutation({
    mutationFn: (userId: string) => api.admin.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setPendingBlockUser(null);
    },
    onError: (err: Error) => {
      alert(`Failed to block user: ${err.message}`);
    },
  });

  // Unblock User Mutation
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => api.admin.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: Error) => {
      alert(`Failed to unblock user: ${err.message}`);
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.admin.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setPendingDeleteUser(null);
    },
    onError: (err: Error) => {
      alert(`Failed to delete user account: ${err.message}`);
    },
  });

  // Create Administrator Mutation
  const createAdminMutation = useMutation({
    mutationFn: (payload: { email: string; password: string; displayName: string }) =>
      api.admin.createAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setIsCreateAdminOpen(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      alert('Administrator account provisioned successfully!');
    },
    onError: (err: Error) => {
      alert(`Failed to create administrator: ${err.message}`);
    },
  });

  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPassword) return;
    createAdminMutation.mutate({
      displayName: newAdminName.trim(),
      email: newAdminEmail.trim(),
      password: newAdminPassword,
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualRefreshAll = () => {
    refetchMetrics();
    refetchHealth();
    refetchUsers();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const metrics = metricsData?.data;
  const health = healthData?.data;
  const usersPage = usersData?.data;

  // Format relative time helper
  const formatTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo & Console Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <LifeStackLogo className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 drop-shadow-sm" withBackground={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate">LifeStack</span>
                <span className="rounded-md bg-purple-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-purple-700 uppercase tracking-wide border border-purple-200 shrink-0">
                  Admin Console
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                System Operations & User Moderation
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Auto-Refresh Toggle */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <span
                className={`h-2 w-2 rounded-full ${
                  autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-[11px] font-semibold hover:text-slate-900 cursor-pointer"
              >
                {autoRefresh ? 'Live Auto-Sync (15s)' : 'Auto-Sync Paused'}
              </button>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefreshAll}
              disabled={metricsRefetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Refresh all metrics"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-500 ${metricsRefetching ? 'animate-spin' : ''}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {/* Jump to standard User Workspace */}
            <Link
              to="/"
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-brand-50 border border-brand-200 px-2 sm:px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
              title="Switch to User Workspace"
            >
              <span className="hidden sm:inline">User Workspace</span>
              <span className="sm:hidden text-[11px]">App</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
              title="Sign out of Admin Session"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Top 4 Real-Time Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Real-time Concurrent Active Sessions */}
          <div className="rounded-2xl border border-brand-200/90 bg-gradient-to-br from-white via-brand-50/20 to-sky-50/40 p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-brand-600" />
                Active Sessions
              </span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {metricsLoading ? '-' : metrics?.activeSessions ?? 0}
              </span>
              <span className="text-xs font-semibold text-emerald-600">Concurrent Sessions</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {metricsLoading
                ? 'Loading sessions...'
                : `${metrics?.activeUsersCount ?? 0} distinct users currently online`}
            </p>
          </div>

          {/* 2. DAU Metric (7-Day & 30-Day Averages) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" />
                Daily Active Users
              </span>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                DAU
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {metricsLoading ? '-' : metrics?.dauMetrics?.sevenDayAverageDau ?? 0}
              </span>
              <span className="text-xs font-semibold text-indigo-600">7-Day Avg DAU</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>30-Day Avg: {metrics?.dauMetrics?.thirtyDayAverageDau ?? 0}</span>
              <span className="font-semibold text-slate-700">
                Today: {metrics?.dauMetrics?.todayDau ?? 0}
              </span>
            </div>
          </div>

          {/* 3. Total Users & Account Status Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                User Directory
              </span>
              <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Accounts
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {metricsLoading ? '-' : metrics?.totalUsers ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-600">Total Registered</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {metrics?.activeUsers ?? 0} Active
              </span>
              {metrics?.blockedUsers ? (
                <span className="text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  {metrics.blockedUsers} Suspended
                </span>
              ) : (
                <span className="text-slate-400">0 Suspended</span>
              )}
            </div>
          </div>

          {/* 4. Backend Health Summary & Uptime */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="h-4 w-4 text-amber-500" />
                Backend Health
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                  health?.database?.status === 'UP'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {health?.database?.status === 'UP' ? 'Operational' : 'Degraded'}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {healthLoading ? '-' : health?.server?.uptimeFormatted || 'Online'}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Ping: {health?.database?.latencyMs ?? 0}ms</span>
              <span>Flyway: {health?.flyway?.currentVersion || 'V6'}</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs for Admin Console (Mobile-swipe friendly) */}
        <div className="border-b border-slate-200 flex items-center gap-4 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>User Directory & Moderation</span>
            <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-bold">
              {usersPage?.totalElements ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'health'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Backend System Health</span>
          </button>

          <button
            onClick={() => setActiveTab('dau')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'dau'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>DAU 30-Day Activity Trend</span>
          </button>
        </div>

        {/* TAB 1: User Directory & Moderation */}
        {activeTab === 'users' && (
          <section className="space-y-4">
            {/* Search, Status Filters & Add Admin Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              {/* Status Filter Pills & Add Administrator Button */}
              <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
                      setPage(0);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('ACTIVE');
                      setPage(0);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      statusFilter === 'ACTIVE'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('BLOCKED');
                      setPage(0);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      statusFilter === 'BLOCKED'
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Suspended
                  </button>
                </div>

                {/* Add Administrator Button */}
                <button
                  onClick={() => setIsCreateAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-3 py-1.5 sm:py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Administrator</span>
                </button>
              </div>
            </div>

            {/* User Directory Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">User / Account</th>
                      <th className="py-3.5 px-4">User ID</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Registered Date</th>
                      <th className="py-3.5 px-4">Last Active</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          <div className="flex justify-center mb-2">
                            <LifeStackLoader size="sm" />
                          </div>
                          <span>Loading users directory...</span>
                        </td>
                      </tr>
                    ) : !usersPage?.content || usersPage.content.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      usersPage.content.map((u) => {
                        const isSelf = u.id === currentAdmin?.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* User Name & Email */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs shrink-0 border border-brand-200">
                                  {u.displayName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{u.displayName}</span>
                                    {isSelf && (
                                      <span className="rounded bg-brand-100 text-brand-700 text-[10px] px-1.5 py-0.2 font-semibold">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-slate-500 text-[11px]">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* User ID with Copy Button */}
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleCopyId(u.id)}
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer group"
                                title="Click to copy UUID"
                              >
                                <span>{u.id.substring(0, 8)}...</span>
                                {copiedId === u.id ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
                                )}
                              </button>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                  u.role === 'ADMIN'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Account Status Badge */}
                            <td className="py-3.5 px-4">
                              {u.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[11px] font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  BLOCKED
                                </span>
                              )}
                            </td>

                            {/* Registered Date */}
                            <td className="py-3.5 px-4 text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>

                            {/* Last Active Timestamp */}
                            <td className="py-3.5 px-4">
                              <span
                                className="font-medium text-slate-700"
                                title={u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : ''}
                              >
                                {formatTimeAgo(u.lastActiveAt)}
                              </span>
                            </td>

                            {/* Moderation Actions Button */}
                            <td className="py-3.5 px-4 text-right">
                              {isSelf ? (
                                <span className="text-slate-400 text-[11px] italic">Self</span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {u.status === 'ACTIVE' ? (
                                    <button
                                      onClick={() => setPendingBlockUser(u)}
                                      disabled={blockMutation.isPending || deleteUserMutation.isPending}
                                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                      title="Revoke active sessions and block user"
                                    >
                                      <Lock className="h-3 w-3" />
                                      <span>Block</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => unblockMutation.mutate(u.id)}
                                      disabled={unblockMutation.isPending || deleteUserMutation.isPending}
                                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                      title="Restore user account access"
                                    >
                                      <Unlock className="h-3 w-3" />
                                      <span>Unblock</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setPendingDeleteUser(u)}
                                    disabled={deleteUserMutation.isPending || blockMutation.isPending}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                                    title="Permanently delete user account"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (visible only on mobile md:hidden) */}
              <div className="md:hidden divide-y divide-slate-100">
                {usersLoading ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <div className="flex justify-center mb-2">
                      <LifeStackLoader size="sm" />
                    </div>
                    <span>Loading users directory...</span>
                  </div>
                ) : !usersPage?.content || usersPage.content.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No users found matching your criteria.
                  </div>
                ) : (
                  usersPage.content.map((u) => {
                    const isSelf = u.id === currentAdmin?.id;
                    return (
                      <div key={u.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs shrink-0 border border-brand-200">
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span className="truncate">{u.displayName}</span>
                                {isSelf && (
                                  <span className="rounded bg-brand-100 text-brand-700 text-[10px] px-1.5 font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-[11px] truncate">{u.email}</p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border shrink-0 ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            {u.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                BLOCKED
                              </span>
                            )}
                            <span>Active: {formatTimeAgo(u.lastActiveAt)}</span>
                          </div>

                          <button
                            onClick={() => handleCopyId(u.id)}
                            className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded hover:bg-slate-200"
                          >
                            <span>{u.id.substring(0, 6)}...</span>
                            {copiedId === u.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="pt-1">
                          {isSelf ? (
                            <span className="text-slate-400 text-[11px] italic block text-right">Self Account</span>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {u.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => setPendingBlockUser(u)}
                                  disabled={blockMutation.isPending || deleteUserMutation.isPending}
                                  className="w-full inline-flex justify-center items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                  <span>Block</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => unblockMutation.mutate(u.id)}
                                  disabled={unblockMutation.isPending || deleteUserMutation.isPending}
                                  className="w-full inline-flex justify-center items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <Unlock className="h-3.5 w-3.5" />
                                  <span>Unblock</span>
                                </button>
                              )}

                              <button
                                onClick={() => setPendingDeleteUser(u)}
                                disabled={deleteUserMutation.isPending || blockMutation.isPending}
                                className="w-full inline-flex justify-center items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {usersPage && usersPage.totalPages > 1 && (
                <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    Showing page <span className="font-bold">{usersPage.number + 1}</span> of{' '}
                    <span className="font-bold">{usersPage.totalPages}</span> ({usersPage.totalElements} users)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={usersPage.last}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 2: Backend System Health */}
        {activeTab === 'health' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1: Database Connectivity & Pool */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Database Engine & Pools</h3>
                      <p className="text-[11px] text-slate-500">
                        {health?.database?.product || 'PostgreSQL'} {health?.database?.version}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      health?.database?.status === 'UP'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {health?.database?.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-center text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 sm:p-3">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ping Latency</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 mt-1 block">
                      {health?.database?.latencyMs ?? 0} ms
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 sm:p-3">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Pool</span>
                    <span className="text-sm sm:text-base font-bold text-brand-600 mt-1 block">
                      {health?.database?.activeConnections ?? 0}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 sm:p-3">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Idle / Max</span>
                    <span className="text-sm sm:text-base font-bold text-slate-700 mt-1 block">
                      {health?.database?.idleConnections ?? 0} / {health?.database?.maxConnections ?? 10}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Flyway Migrations Status */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Flyway Schema Migrations</h3>
                      <p className="text-[11px] text-slate-500">Automated SQL Database Versioning</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                    {health?.flyway?.status || 'SUCCESS'}
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Current Schema Version</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      V{health?.flyway?.currentVersion || '6'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Last Executed Script</span>
                    <span className="font-mono text-slate-800 text-[11px] truncate max-w-[180px] sm:max-w-xs">
                      {health?.flyway?.lastMigration || 'V6__add_user_roles_status_and_activity.sql'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Total Migrations Applied</span>
                    <span className="font-bold text-slate-900">{health?.flyway?.totalMigrations || 6} scripts</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Cloud Security & Audit Logs (Replaces JVM Heap for Cloud Production) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Cloud Security & Audit Logs</h3>
                      <p className="text-[11px] text-slate-500">Continuous Cloud Compliance & Access Guard</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ENFORCED
                  </span>
                </div>

                {/* Cloud Security Parameters */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Public Signup</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                      {health?.security?.publicSignupPolicy || 'Locked (USER Only)'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Admin Provisioning</span>
                    <span className="text-xs font-bold text-purple-700 mt-0.5 block truncate">
                      {health?.security?.adminProvisioningPolicy || 'Admin Required'}
                    </span>
                  </div>
                </div>

                {/* Live Audit Log Stream */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Operational Security Event Stream
                  </span>
                  <div className="rounded-xl bg-slate-900 text-slate-200 p-3 font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto no-scrollbar border border-slate-800">
                    {(health?.security?.auditLogs || [
                      '[SECURITY] Public registration restricted strictly to Role.USER',
                      '[SECURITY] Administrator accounts restricted to verified admin provisioning',
                      '[ISOLATION] Multi-tenant workspace data strictly partitioned by owner ID',
                      '[DATABASE] PostgreSQL connection pool active (HikariCP SSL/TLS)',
                      '[MIGRATIONS] Flyway automated schema verified at version V6',
                      '[MONITOR] Cloud minimal logging profile active (SQL formatting suppressed)',
                    ]).map((logLine, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 select-none shrink-0">&bull;</span>
                        <span className={logLine.includes('[SECURITY]') ? 'text-amber-300' : 'text-slate-300'}>
                          {logLine}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: Server Runtime & Specs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Server Host & Uptime</h3>
                      <p className="text-[11px] text-slate-500">Continuous Service Availability</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Live
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">System Uptime</span>
                    <span className="font-bold text-slate-900">{health?.server?.uptimeFormatted || 'Online'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Framework Stack</span>
                    <span className="font-semibold text-slate-700">
                      Spring Boot {health?.server?.springBootVersion || '3.4.3'} (Java{' '}
                      {health?.server?.javaVersion || '21'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Service Boot Timestamp</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {health?.server?.startTime ? new Date(health.server.startTime).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: DAU 30-Day Activity Trend */}
        {activeTab === 'dau' && (
          <section className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">30-Day Daily Active Users (DAU)</h3>
                  <p className="text-xs text-slate-500">
                    Unique authenticated accounts engaging with LifeStack workspaces each day
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
                  <div className="bg-brand-50 border border-brand-200 px-2.5 sm:px-3 py-1.5 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">7-Day Moving Avg</span>
                    <span className="font-bold text-brand-700 text-xs sm:text-sm">
                      {metrics?.dauMetrics?.sevenDayAverageDau ?? 0} users
                    </span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 px-2.5 sm:px-3 py-1.5 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">30-Day Moving Avg</span>
                    <span className="font-bold text-purple-700 text-xs sm:text-sm">
                      {metrics?.dauMetrics?.thirtyDayAverageDau ?? 0} users
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-4">
                <div className="h-56 w-full flex items-end gap-1.5 sm:gap-2 pb-4 border-b border-slate-200 overflow-x-auto">
                  {metrics?.dauMetrics?.history?.map((pt, index) => {
                    const maxVal = Math.max(
                      1,
                      ...(metrics.dauMetrics.history?.map((h) => h.activeUsers) || [1])
                    );
                    const heightPercent = Math.max(8, Math.round((pt.activeUsers / maxVal) * 100));
                    const isToday = index === (metrics?.dauMetrics?.history?.length || 0) - 1;

                    return (
                      <div
                        key={pt.date}
                        className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded px-2 py-1 shadow-md pointer-events-none z-20 whitespace-nowrap">
                          {pt.date}: {pt.activeUsers} active
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isToday
                              ? 'bg-brand-600 group-hover:bg-brand-700'
                              : pt.activeUsers > 0
                              ? 'bg-sky-400 group-hover:bg-sky-500'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Day Number Label */}
                        <span className="text-[9px] text-slate-400 group-hover:text-slate-700">
                          {pt.date.split('-')[2]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                  <span>30 Days Ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <LifeStackLogo className="h-5 w-5" withBackground={false} />
            <span className="font-semibold text-slate-700">LifeStack Admin Console</span>
            <span className="text-slate-300">&bull;</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/terms" className="hover:text-slate-900 font-medium transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-300">&bull;</span>
            <a
              href="https://soumya-here.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1 transition-colors"
            >
              <span>Crafted by Soumya</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal for Blocking a User */}
      {pendingBlockUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Block {pendingBlockUser.displayName}?
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Blocking this account will immediately revoke all active sessions for{' '}
                  <strong className="text-slate-900">{pendingBlockUser.email}</strong>. Subsequent
                  login attempts will be denied with HTTP 403 Forbidden (&quot;Account is suspended&quot;).
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono text-slate-700">{pendingBlockUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Workspaces:</span>
                <span className="font-semibold text-slate-700">{pendingBlockUser.workspacesCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingBlockUser(null)}
                disabled={blockMutation.isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => blockMutation.mutate(pendingBlockUser.id)}
                disabled={blockMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {blockMutation.isPending ? (
                  <>
                    <LifeStackLoader size="xs" />
                    <span>Blocking...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Confirm Block</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Permanently Deleting a User */}
      {pendingDeleteUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Permanently Delete {pendingDeleteUser.displayName}?
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete the account for{' '}
                  <strong className="text-slate-900">{pendingDeleteUser.email}</strong>? This will immediately revoke active sessions and permanently delete all their workspaces, roadmaps, and career data from the database.
                </p>
              </div>
            </div>

            <div className="bg-red-50/70 rounded-xl p-3 text-xs border border-red-200 space-y-1 text-red-800">
              <div className="flex justify-between">
                <span className="font-semibold">User Role:</span>
                <span className="font-bold">{pendingDeleteUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Workspaces Erased:</span>
                <span className="font-bold">{pendingDeleteUser.workspacesCount} workspaces</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingDeleteUser(null)}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(pendingDeleteUser.id)}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <LifeStackLoader size="xs" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add or Provision New Administrator */}
      {isCreateAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Administrator</h3>
                  <p className="text-xs text-slate-500">Register another admin through this console</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateAdminOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin2@lifestack.dev"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-[11px] text-purple-900 leading-relaxed">
                This account will be provisioned with full <span className="font-bold">ROLE_ADMIN</span> privileges, a dedicated Admin workspace, and immediate access to this console.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {createAdminMutation.isPending ? (
                    <>
                      <LifeStackLoader size="xs" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Provision Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
