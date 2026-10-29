import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BellRing, Check, Clock, X, Volume2 } from 'lucide-react';
import { api, ScheduleItem } from '@/lib/api';
import { stopNotificationSound } from '@/lib/audioNotifier';

interface ScheduleAlertModalProps {
  alert: ScheduleItem | null;
  onClose: () => void;
}

export function ScheduleAlertModal({ alert, onClose }: ScheduleAlertModalProps) {
  const queryClient = useQueryClient();

  const handleClose = () => {
    stopNotificationSound();
    onClose();
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'COMPLETED' | 'DISMISSED' }) =>
      api.schedules.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      handleClose();
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
      handleClose();
    },
  });

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner animate-bounce">
              <BellRing className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  {alert.itemType}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    alert.priority === 'URGENT'
                      ? 'bg-rose-500 text-white'
                      : alert.priority === 'HIGH'
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {alert.priority}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">Schedule Alert Due Now!</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">{alert.title}</h4>
            {alert.targetName && (
              <p className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md inline-block mt-1.5 border border-brand-100">
                Linked: {alert.targetName}
              </p>
            )}
            {alert.description && (
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {alert.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Scheduled for {new Date(alert.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {alert.soundEnabled && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                <Volume2 className="h-3.5 w-3.5" />
                Sound Alert Enabled
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => updateStatusMutation.mutate({ id: alert.id, status: 'COMPLETED' })}
              disabled={updateStatusMutation.isPending}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Mark Done</span>
            </button>
            <button
              onClick={() => snoozeMutation.mutate({ id: alert.id, minutes: 10 })}
              disabled={snoozeMutation.isPending}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Snooze (10m)</span>
            </button>
            <button
              onClick={handleClose}
              className="inline-flex items-center justify-center px-3.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

