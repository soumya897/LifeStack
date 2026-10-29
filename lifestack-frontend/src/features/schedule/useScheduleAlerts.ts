import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ScheduleItem } from '@/lib/api';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { playNotificationChime, sendSystemNotification } from '@/lib/audioNotifier';

export function useScheduleAlerts() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [activeAlert, setActiveAlert] = useState<ScheduleItem | null>(null);

  // Track triggered alert IDs in local memory during the session to avoid duplicate bells
  const triggeredIdsRef = useRef<Set<string>>(new Set());

  // Fetch pending schedules
  const { data: pendingSchedules = [] } = useQuery<ScheduleItem[]>({
    queryKey: ['schedules', currentWorkspace?.id, 'PENDING'],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.schedules.list(currentWorkspace.id, 'PENDING');
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
    refetchInterval: 15000, // Check every 15 seconds
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => api.schedules.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const checkDueAlerts = useCallback(() => {
    if (!pendingSchedules || pendingSchedules.length === 0) return;

    const now = Date.now();

    for (const item of pendingSchedules) {
      const scheduledTime = new Date(item.scheduledAt).getTime();

      // If scheduled time has arrived and hasn't been notified/acknowledged yet
      if (scheduledTime <= now && !item.notifiedAt && !triggeredIdsRef.current.has(item.id)) {
        triggeredIdsRef.current.add(item.id);

        // 1. Play synthesized audio chime if sound is enabled
        if (item.soundEnabled) {
          playNotificationChime();
        }

        // 2. Dispatch OS system notification
        sendSystemNotification(`⏰ Alert: ${item.title}`, {
          body: item.description || `Scheduled ${item.itemType} alert is due now.`,
          tag: `schedule-${item.id}`,
        });

        // 3. Open in-app alert card/modal
        setActiveAlert(item);

        // 4. Mark acknowledged on backend
        acknowledgeMutation.mutate(item.id);

        break; // Show one at a time for clean UX
      }
    }
  }, [pendingSchedules, acknowledgeMutation]);

  useEffect(() => {
    checkDueAlerts();
    const interval = setInterval(checkDueAlerts, 10000);
    return () => clearInterval(interval);
  }, [checkDueAlerts]);

  const dismissAlert = () => {
    setActiveAlert(null);
  };

  return { activeAlert, dismissAlert };
}
