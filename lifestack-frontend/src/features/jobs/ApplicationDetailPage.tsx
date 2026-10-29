import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  ExternalLink,
  History,
  Link2,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  api,
  ApplicationDetail,
  InterviewEvent,
  ApplicationStatus,
  CreateInterviewPayload,
  UpdateInterviewPayload,
  UpdateApplicationPayload,
  Note,
} from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { ApplicationStatusBadge, WorkModeBadge, InterviewResultBadge, InterviewStatusBadge, EventTypeLabel } from './components/JobStatusBadge';
import { ApplicationModal } from './components/ApplicationModal';
import { InterviewEventModal } from './components/InterviewEventModal';
import { LifeStackLoader } from '@/components/LifeStackLoader';

const ALL_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
  'ON_HOLD',
];

export const ApplicationDetailPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'interviews' | 'history' | 'notes'>('interviews');
  const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewEvent | null>(null);
  const [selectedNoteToLink, setSelectedNoteToLink] = useState('');

  // Fetch Application Detail
  const {
    data: detailResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['job-application-detail', applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error('Application ID missing');
      const res = await api.applications.get(applicationId);
      return res.data;
    },
    enabled: !!applicationId,
  });

  const app: ApplicationDetail | undefined = detailResponse;

  // Fetch Workspace Notes for attaching
  const { data: workspaceNotes = [] } = useQuery<Note[]>({
    queryKey: ['notes', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.notes.list(currentWorkspace.id);
      return res.data;
    },
    enabled: !!currentWorkspace?.id && activeTab === 'notes',
  });

  // Mutation: Update application (e.g. status or details)
  const updateAppMutation = useMutation({
    mutationFn: (payload: UpdateApplicationPayload) => {
      if (!applicationId) throw new Error('No application id');
      return api.applications.update(applicationId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Mutation: Delete application
  const deleteAppMutation = useMutation({
    mutationFn: () => {
      if (!applicationId) throw new Error('No application id');
      return api.applications.delete(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      navigate('/jobs');
    },
  });

  // Mutation: Create Interview Round
  const createInterviewMutation = useMutation({
    mutationFn: (payload: CreateInterviewPayload) => {
      if (!applicationId) throw new Error('No application id');
      return api.interviews.create(applicationId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Mutation: Update Interview Round
  const updateInterviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInterviewPayload }) =>
      api.interviews.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Mutation: Delete Interview Round
  const deleteInterviewMutation = useMutation({
    mutationFn: (id: string) => api.interviews.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['job-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  // Mutation: Link Note
  const linkNoteMutation = useMutation({
    mutationFn: (noteId: string) => {
      if (!applicationId) throw new Error('No application id');
      return api.applications.linkNote(applicationId, noteId);
    },
    onSuccess: () => {
      setSelectedNoteToLink('');
      queryClient.invalidateQueries({ queryKey: ['job-application-detail', applicationId] });
    },
  });

  // Mutation: Unlink Note
  const unlinkNoteMutation = useMutation({
    mutationFn: (noteId: string) => {
      if (!applicationId) throw new Error('No application id');
      return api.applications.unlinkNote(applicationId, noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-application-detail', applicationId] });
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <LifeStackLoader size="lg" center label="Loading application details..." />
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="font-semibold text-sm">Failed to load application</p>
        <p className="text-xs mt-1 text-red-600">
          {error instanceof Error ? error.message : 'Application not found or inaccessible.'}
        </p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50"
        >
          Return to Pipeline
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    try {
      await updateAppMutation.mutateAsync({ status: newStatus });
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const handleDeleteApplication = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete application "${app.jobTitle}" at ${app.companyName}? This will remove all associated interview logs and audit histories.`
      )
    ) {
      await deleteAppMutation.mutateAsync();
    }
  };

  const handleInterviewModalSubmit = async (
    payload: CreateInterviewPayload | UpdateInterviewPayload
  ) => {
    if (editingInterview) {
      await updateInterviewMutation.mutateAsync({
        id: editingInterview.id,
        payload: payload as UpdateInterviewPayload,
      });
    } else {
      await createInterviewMutation.mutateAsync(payload as CreateInterviewPayload);
    }
  };

  const handleDeleteInterview = async (interview: InterviewEvent) => {
    if (window.confirm(`Delete round "${interview.roundName}"?`)) {
      await deleteInterviewMutation.mutateAsync(interview.id);
    }
  };

  const attachedNotes = workspaceNotes.filter((n) => app.attachedNoteIds?.includes(n.id));
  const unattachedNotes = workspaceNotes.filter((n) => !app.attachedNoteIds?.includes(n.id));

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {app.companyName}
              </h1>
              {app.jobUrl && (
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-slate-100 p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                  title="View original job post"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <ApplicationStatusBadge status={app.status} size="md" />
            </div>

            <p className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-400" />
              {app.jobTitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {app.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {app.location}
                </span>
              )}

              <WorkModeBadge mode={app.workMode} />

              {app.salary && (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  {app.salary}
                </span>
              )}

              {app.appliedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Applied: {app.appliedAt}
                </span>
              )}

              {app.followUpAt && (
                <span className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Follow-up: {app.followUpAt}
                </span>
              )}
            </div>

            {app.notes && (
              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 border border-slate-100 mt-2">
                <span className="font-semibold block text-slate-800 mb-1">Recruiter / Job Notes:</span>
                <p className="whitespace-pre-line text-slate-600">{app.notes}</p>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Stage:</span>
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditAppModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={handleDeleteApplication}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-2xs hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-slate-200 text-xs font-semibold overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('interviews')}
            className={`border-b-2 py-3 px-4 transition-colors flex items-center gap-2 ${
              activeTab === 'interviews'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-4 w-4" />
            Interview Rounds
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {app.interviews?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 py-3 px-4 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="h-4 w-4" />
            Status Audit Trail
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {app.history?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`border-b-2 py-3 px-4 transition-colors flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            Notes & Prep Docs
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {app.attachedNoteIds?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interview Rounds */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Interview Schedule & Timeline</h3>
            <button
              onClick={() => {
                setEditingInterview(null);
                setIsInterviewModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Schedule Round
            </button>
          </div>

          {app.interviews && app.interviews.length > 0 ? (
            <div className="space-y-3">
              {app.interviews.map((round, idx) => (
                <div
                  key={round.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{round.roundName}</h4>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                          <EventTypeLabel type={round.eventType} />
                        </span>
                        <InterviewStatusBadge status={round.status} />
                        <InterviewResultBadge result={round.result} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {round.scheduledAt && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Scheduled:{' '}
                            <strong className="text-slate-700">
                              {new Date(round.scheduledAt).toLocaleString()}
                            </strong>
                          </span>
                        )}
                        {round.occurredAt && (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Completed:{' '}
                            <strong className="text-slate-700">
                              {new Date(round.occurredAt).toLocaleString()}
                            </strong>
                          </span>
                        )}
                      </div>

                      {round.notes && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                          <span className="font-semibold block text-slate-800 mb-0.5">
                            Questions Asked & Round Notes:
                          </span>
                          <p className="whitespace-pre-line text-slate-600">{round.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-start">
                      <button
                        onClick={() => {
                          setEditingInterview(round);
                          setIsInterviewModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit round"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(round)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete round"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No interview rounds scheduled yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Log recruiter calls, live coding interviews, or system design reviews.
              </p>
              <button
                onClick={() => {
                  setEditingInterview(null);
                  setIsInterviewModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule First Round
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Status Audit Trail */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Chronological Pipeline Transitions</h3>

          {app.history && app.history.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {app.history.map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      {h.fromStatus ? (
                        <>
                          <ApplicationStatusBadge status={h.fromStatus} />
                          <span className="text-slate-400">&rarr;</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Initial state:</span>
                      )}
                      <ApplicationStatusBadge status={h.toStatus} />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(h.createdAt).toLocaleDateString()} at{' '}
                      {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {h.notes && (
                    <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {h.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No status changes recorded yet.</p>
          )}
        </div>
      )}

      {/* Tab 3: Notes & Attached Resources */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Link Existing Workspace Note */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Attach Workspace Note</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Link company research, interview cheat sheets, or behavioral stories to this application.
            </p>

            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedNoteToLink}
                onChange={(e) => setSelectedNoteToLink(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select a note from workspace...</option>
                {unattachedNotes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>

              <button
                disabled={!selectedNoteToLink || linkNoteMutation.isPending}
                onClick={() => linkNoteMutation.mutate(selectedNoteToLink)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
              >
                <Link2 className="h-3.5 w-3.5" />
                Attach Note
              </button>
            </div>
          </div>

          {/* Attached Notes List */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Linked Notes</h3>

            {attachedNotes.length > 0 ? (
              <div className="space-y-3">
                {attachedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-brand-600 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{note.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{note.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/notes')}
                        className="rounded-lg p-1 text-slate-400 hover:text-brand-600"
                        title="View in Notes"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => unlinkNoteMutation.mutate(note.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-red-600"
                        title="Unlink note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No notes linked to this application yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {currentWorkspace?.id && (
        <ApplicationModal
          isOpen={isEditAppModalOpen}
          onClose={() => setIsEditAppModalOpen(false)}
          onSubmit={async (payload) => {
            await updateAppMutation.mutateAsync(payload as UpdateApplicationPayload);
          }}
          initialData={app}
          workspaceId={currentWorkspace.id}
        />
      )}

      {/* Schedule / Edit Interview Round Modal */}
      <InterviewEventModal
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false);
          setEditingInterview(null);
        }}
        onSubmit={handleInterviewModalSubmit}
        initialData={editingInterview}
        companyName={app.companyName}
      />
    </div>
  );
};
