import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BellRing,
  Clock,
  Plus,
  Volume2,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  Briefcase,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { api, ScheduleItem, ScheduleItemType, ScheduleStatus, AlertPriority } from '@/lib/api';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { ScheduleModal, ScheduleFormValues } from './ScheduleModal';
import { playNotificationChime, requestNotificationPermission } from '@/lib/audioNotifier';

export function SchedulePage() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'TODAY' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [notificationPermissionState, setNotificationPermissionState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Fetch Schedules
  const { data: schedules = [], isLoading, error, refetch } = useQuery<ScheduleItem[]>({
    queryKey: ['schedules', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.schedules.list(currentWorkspace.id);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values: ScheduleFormValues) =>
      api.schedules.create({
        workspaceId: currentWorkspace!.id,
        title: values.title,
        description: values.description,
        itemType: values.itemType,
        targetName: values.targetName,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        priority: values.priority,
        soundEnabled: values.soundEnabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ScheduleFormValues }) =>
      api.schedules.update(id, {
        title: values.title,
        description: values.description,
        itemType: values.itemType,
        targetName: values.targetName,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        priority: values.priority,
        soundEnabled: values.soundEnabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScheduleStatus }) =>
      api.schedules.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => {
      const snoozedTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      return api.schedules.update(id, { scheduledAt: snoozedTime });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.schedules.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const handleSave = async (values: ScheduleFormValues) => {
    if (!currentWorkspace?.id) return;
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setNotificationPermissionState(res);
  };

  // Categorize counts
  const counts = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toDateString();

    let upcoming = 0;
    let today = 0;
    let overdue = 0;
    let completed = 0;

    for (const item of schedules) {
      if (item.status === 'COMPLETED') {
        completed++;
        continue;
      }
      const itemTime = new Date(item.scheduledAt).getTime();
      const itemDateStr = new Date(item.scheduledAt).toDateString();

      if (itemTime < now) {
        overdue++;
      } else if (itemDateStr === todayStr) {
        today++;
      } else {
        upcoming++;
      }
    }

    return { all: schedules.length, upcoming, today, overdue, completed };
  }, [schedules]);

  // Filtered list
  const filteredSchedules = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toDateString();

    return schedules.filter((item) => {
      // 1. Search query
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesTarget = item.targetName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTarget) return false;
      }

      // 2. Category filter
      if (categoryFilter !== 'ALL' && item.itemType !== categoryFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'COMPLETED') return item.status === 'COMPLETED';

      // For non-completed filters, exclude completed
      if (item.status === 'COMPLETED') return false;

      const itemTime = new Date(item.scheduledAt).getTime();
      const itemDateStr = new Date(item.scheduledAt).toDateString();

      if (statusFilter === 'OVERDUE') {
        return itemTime < now;
      }
      if (statusFilter === 'TODAY') {
        return itemDateStr === todayStr && itemTime >= now;
      }
      if (statusFilter === 'UPCOMING') {
        return itemDateStr !== todayStr && itemTime >= now;
      }

      return true;
    });
  }, [schedules, search, categoryFilter, statusFilter]);

  const getCategoryIcon = (type: ScheduleItemType) => {
    switch (type) {
      case 'TOPIC':
        return <BookOpen className="h-4 w-4 text-emerald-600" />;
      case 'ROADMAP':
        return <Sparkles className="h-4 w-4 text-indigo-600" />;
      case 'JOB_APPLICATION':
        return <Briefcase className="h-4 w-4 text-amber-600" />;
      case 'CUSTOM_ALERT':
        return <BellRing className="h-4 w-4 text-rose-600" />;
      case 'TASK':
      default:
        return <CheckSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatScheduledDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-sky-400 text-white rounded-xl shadow-md shadow-brand-500/20">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Schedule & Alerts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Unified scheduling, deadlines, and audio alarms for tasks, learning topics, and job interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Test Sound Button */}
          <button
            onClick={() => playNotificationChime()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors flex-1 sm:flex-initial"
            title="Preview synthesized chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Test Sound</span>
          </button>

          {/* Desktop Notifications Permission Button */}
          {notificationPermissionState !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl transition-colors flex-1 sm:flex-initial"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          {/* New Schedule Button */}
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-md shadow-brand-500/20 transition-all w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Schedule & Alert
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { key: 'ALL', label: 'All Items', count: counts.all },
          { key: 'UPCOMING', label: 'Upcoming', count: counts.upcoming },
          { key: 'TODAY', label: 'Due Today', count: counts.today },
          { key: 'OVERDUE', label: 'Overdue', count: counts.overdue, highlight: counts.overdue > 0 },
          { key: 'COMPLETED', label: 'Completed', count: counts.completed },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.highlight
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'ALL', label: 'All Categories' },
            { key: 'TASK', label: 'Tasks' },
            { key: 'TOPIC', label: 'Topics' },
            { key: 'ROADMAP', label: 'Roadmaps' },
            { key: 'JOB_APPLICATION', label: 'Job Pipeline' },
            { key: 'CUSTOM_ALERT', label: 'Alarms' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                categoryFilter === cat.key
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts or topics..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center max-w-md mx-auto space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-rose-900">Failed to load schedules</h3>
          <p className="text-xs text-rose-600 leading-relaxed">
            {(error as Error)?.message || 'An unexpected error occurred while fetching your schedules.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading your schedule & alerts...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <BellRing className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No scheduled items found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {schedules.length === 0
              ? 'Schedule study sessions, mock interviews, roadmap milestones, or custom alarms with audio notifications.'
              : 'No items match your active filter or search query.'}
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Schedule & Alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((item) => {
            const isPast = new Date(item.scheduledAt).getTime() < Date.now();
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isCompleted
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-75'
                    : isPast
                    ? 'border-rose-200/80 bg-rose-50/20'
                    : 'border-slate-200 hover:border-brand-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top: Badges & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200/80">
                        {getCategoryIcon(item.itemType)}
                        <span>{item.itemType}</span>
                      </div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    {/* Sound indicator & complete checkbox */}
                    <div className="flex items-center gap-1.5">
                      {item.soundEnabled && (
                        <span title="Audio chime enabled">
                          <Volume2 className="h-3.5 w-3.5 text-brand-600" />
                        </span>
                      )}
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: item.id,
                            status: isCompleted ? 'PENDING' : 'COMPLETED',
                          })
                        }
                        title={isCompleted ? 'Mark pending' : 'Mark completed'}
                        className={`p-1 rounded-lg border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-300 hover:text-emerald-600'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      className={`text-sm font-bold leading-snug ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-brand-600'
                      } transition-colors`}
                    >
                      {item.title}
                    </h3>

                    {item.targetName && (
                      <p className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-1.5 border border-brand-100">
                        {item.targetName}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Date/Time & Snooze/Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                      isCompleted
                        ? 'text-slate-400'
                        : isPast
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatScheduledDate(item.scheduledAt)}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {!isCompleted && (
                      <button
                        onClick={() => snoozeMutation.mutate({ id: item.id, minutes: 15 })}
                        title="Snooze 15 minutes"
                        className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-md transition-colors border border-slate-200/60"
                      >
                        +15m
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      title="Edit"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      title="Delete"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        initialData={editingItem}
      />
    </div>
  );
}
