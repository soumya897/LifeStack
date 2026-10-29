import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  GitBranch,
  Send,
} from 'lucide-react';
import {
  api,
  Template,
  TemplateDetail,
  TemplateVersion,
  FieldDefinition,
  CreateFieldDefinitionPayload,
  UpdateFieldDefinitionPayload,
  CreateTemplatePayload,
  UpdateTemplatePayload,
} from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { DynamicFormRenderer } from './components/DynamicFormRenderer';
import { FieldDefinitionModal } from './components/FieldDefinitionModal';
import { TemplateModal } from './components/TemplateModal';

export const CustomizationStudioPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);

  // Live preview testing state
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [previewSuccessMsg, setPreviewSuccessMsg] = useState(false);

  // Query: Templates list
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    isFetching,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ['templates', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.templates.list(currentWorkspace.id);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Auto-select first template if none selected
  const activeTemplateId = selectedTemplateId || (templates.length > 0 ? templates[0].id : null);

  // Query: Template detail (versions and fields)
  const {
    data: templateDetail,
    isLoading: isLoadingDetail,
  } = useQuery<TemplateDetail | null>({
    queryKey: ['template-detail', activeTemplateId],
    queryFn: async () => {
      if (!activeTemplateId) return null;
      const res = await api.templates.get(activeTemplateId);
      return res.data;
    },
    enabled: !!activeTemplateId,
  });

  // Determine active version
  const activeVersion: TemplateVersion | undefined =
    templateDetail?.versions.find((v) => v.id === selectedVersionId) ||
    templateDetail?.activeVersion ||
    templateDetail?.versions[0];

  // Mutation: Create Template
  const createTemplateMutation = useMutation({
    mutationFn: (payload: CreateTemplatePayload) => api.templates.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setSelectedTemplateId(res.data.id);
      setSelectedVersionId(res.data.versions[0]?.id || null);
    },
  });

  // Mutation: Update Template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      api.templates.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
    },
  });

  // Mutation: Delete Template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setSelectedTemplateId(null);
      setSelectedVersionId(null);
    },
  });

  // Mutation: Create Version
  const createVersionMutation = useMutation({
    mutationFn: (tplId: string) => api.templates.createVersion(tplId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setSelectedVersionId(res.data.id);
    },
  });

  // Mutation: Publish Version
  const publishVersionMutation = useMutation({
    mutationFn: ({ tplId, vId }: { tplId: string; vId: string }) =>
      api.templates.publishVersion(tplId, vId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  // Mutation: Add Field
  const addFieldMutation = useMutation({
    mutationFn: ({ vId, payload }: { vId: string; payload: CreateFieldDefinitionPayload }) =>
      api.templates.addField(vId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
    },
  });

  // Mutation: Update Field
  const updateFieldMutation = useMutation({
    mutationFn: ({ fId, payload }: { fId: string; payload: UpdateFieldDefinitionPayload }) =>
      api.templates.updateField(fId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
    },
  });

  // Mutation: Delete Field
  const deleteFieldMutation = useMutation({
    mutationFn: (fId: string) => api.templates.deleteField(fId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
    },
  });

  // Mutation: Reorder Fields
  const reorderFieldsMutation = useMutation({
    mutationFn: ({ vId, fieldIds }: { vId: string; fieldIds: string[] }) =>
      api.templates.reorderFields(vId, fieldIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-detail', activeTemplateId] });
    },
  });

  const handleFieldModalSubmit = async (
    payload: CreateFieldDefinitionPayload | UpdateFieldDefinitionPayload
  ) => {
    if (editingField) {
      await updateFieldMutation.mutateAsync({
        fId: editingField.id,
        payload: payload as UpdateFieldDefinitionPayload,
      });
    } else if (activeVersion) {
      await addFieldMutation.mutateAsync({
        vId: activeVersion.id,
        payload: payload as CreateFieldDefinitionPayload,
      });
    }
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!activeVersion || !activeVersion.fieldDefinitions) return;
    const fields = [...activeVersion.fieldDefinitions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const temp = fields[index];
    fields[index] = fields[targetIdx];
    fields[targetIdx] = temp;

    const ids = fields.map((f) => f.id);
    reorderFieldsMutation.mutate({ vId: activeVersion.id, fieldIds: ids });
  };

  const handleDeleteTemplate = async (tpl: Template) => {
    if (
      window.confirm(
        `Are you sure you want to delete template "${tpl.name}"? This cannot be undone.`
      )
    ) {
      await deleteTemplateMutation.mutateAsync(tpl.id);
    }
  };

  // Test validate preview form
  const handleTestPreviewSubmit = () => {
    if (!activeVersion || !activeVersion.fieldDefinitions) return;
    const errors: Record<string, string> = {};

    for (const def of activeVersion.fieldDefinitions) {
      const val = previewValues[def.fieldKey];
      if (def.required && (val === undefined || val === null || val === '')) {
        errors[def.fieldKey] = `${def.label} is required.`;
      }
    }

    setPreviewErrors(errors);
    if (Object.keys(errors).length === 0) {
      setPreviewSuccessMsg(true);
      setTimeout(() => setPreviewSuccessMsg(false), 3000);
    } else {
      setPreviewSuccessMsg(false);
    }
  };

  const isDraft = activeVersion?.status === 'DRAFT';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Customization Studio
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Create reusable templates, configure custom attributes, and preview dynamic forms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchTemplates()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-brand-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsTemplateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar: Templates List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Templates ({templates.length})
            </span>
          </div>

          {isLoadingTemplates ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <Layers className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No templates created</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Build your first template to add custom attributes.
              </p>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsTemplateModalOpen(true);
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Template
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((tpl) => {
                const isSelected = tpl.id === activeTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setSelectedVersionId(null);
                    }}
                    className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h3
                        className={`text-xs font-bold line-clamp-1 ${
                          isSelected ? 'text-brand-900' : 'text-slate-800'
                        }`}
                      >
                        {tpl.name}
                      </h3>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 shrink-0">
                        {tpl.recordType === 'JOB_APPLICATION' ? 'Job Tracker' : 'Records'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{tpl.versionsCount} {tpl.versionsCount === 1 ? 'version' : 'versions'}</span>
                      {tpl.publishedVersionNumber ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          v{tpl.publishedVersionNumber}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">Draft only</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center & Right Column: Active Template Studio */}
        <div className="lg:col-span-3 space-y-6">
          {isLoadingDetail ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <p className="mt-3 text-xs text-slate-500">Loading template details...</p>
            </div>
          ) : templateDetail && activeVersion ? (
            <>
              {/* Template Header Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{templateDetail.name}</h2>
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                        {templateDetail.recordType}
                      </span>
                    </div>
                    {templateDetail.description && (
                      <p className="mt-1 text-xs text-slate-500">{templateDetail.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTemplate(templateDetail);
                        setIsTemplateModalOpen(true);
                      }}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      title="Edit template details"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(templateDetail)}
                      className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Versions Toolbar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  {/* Version Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-400 mr-1">Version:</span>
                    {templateDetail.versions.map((ver) => {
                      const isActive = ver.id === activeVersion.id;
                      return (
                        <button
                          key={ver.id}
                          onClick={() => {
                            setSelectedVersionId(ver.id);
                            setPreviewValues({});
                            setPreviewErrors({});
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          v{ver.versionNumber}
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                              ver.status === 'PUBLISHED'
                                ? 'bg-emerald-500 text-white'
                                : ver.status === 'DRAFT'
                                ? 'bg-amber-400 text-slate-900'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {ver.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Version Actions */}
                  <div className="flex items-center gap-2">
                    {isDraft ? (
                      <button
                        onClick={() =>
                          publishVersionMutation.mutate({
                            tplId: templateDetail.id,
                            vId: activeVersion.id,
                          })
                        }
                        disabled={publishVersionMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Publish Version {activeVersion.versionNumber}
                      </button>
                    ) : (
                      <button
                        onClick={() => createVersionMutation.mutate(templateDetail.id)}
                        disabled={createVersionMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-900 transition-colors"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        Create Draft Branch (v{templateDetail.latestVersionNumber + 1})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Split Studio: Field Manager vs Live Preview */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Field Definitions Manager */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Field Definitions ({activeVersion.fieldDefinitions?.length || 0})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {isDraft
                          ? 'Add, configure, and reorder attributes.'
                          : 'Version published. Fields are locked to preserve data integrity.'}
                      </p>
                    </div>

                    {isDraft ? (
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setIsFieldModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Field
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  {activeVersion.fieldDefinitions?.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                      <Sliders className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No fields in this version</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click "Add Field" to define your first custom attribute.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeVersion.fieldDefinitions.map((field, idx) => (
                        <div
                          key={field.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                        >
                          {/* Ordering Arrows */}
                          {isDraft && (
                            <div className="flex flex-col gap-0.5">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveField(idx, 'up')}
                                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                disabled={idx === activeVersion.fieldDefinitions.length - 1}
                                onClick={() => handleMoveField(idx, 'down')}
                                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Field Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {field.label}
                              </span>
                              {field.required && (
                                <span className="rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 border border-rose-200">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span className="rounded bg-slate-200 px-1 py-0.2 text-slate-700">
                                {field.fieldType}
                              </span>
                              <span>{field.fieldKey}</span>
                            </div>
                          </div>

                          {/* Field Actions */}
                          {isDraft && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingField(field);
                                  setIsFieldModalOpen(true);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                                title="Edit field"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteFieldMutation.mutate(field.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                title="Delete field"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Live Interactive Form Preview */}
                <div className="rounded-2xl border border-brand-200/80 bg-white p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
                        <Eye className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Live Form Preview</h3>
                        <p className="text-[11px] text-slate-500">
                          Interactive real-time test of Version {activeVersion.versionNumber}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPreviewValues({});
                        setPreviewErrors({});
                        setPreviewSuccessMsg(false);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Reset Form
                    </button>
                  </div>

                  {previewSuccessMsg && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Form validated successfully! All constraints satisfied.</span>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <DynamicFormRenderer
                      fieldDefinitions={activeVersion.fieldDefinitions || []}
                      values={previewValues}
                      errors={previewErrors}
                      onChange={(k, v) => setPreviewValues((prev) => ({ ...prev, [k]: v }))}
                    />

                    {activeVersion.fieldDefinitions?.length > 0 && (
                      <div className="mt-5 border-t border-slate-200 pt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleTestPreviewSubmit}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Test Form Validation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <Layers className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Select or create a template</p>
              <p className="text-xs text-slate-400 mt-1">
                Choose a template from the left pane to edit fields and view the live form preview.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      {currentWorkspace?.id && (
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setEditingTemplate(null);
          }}
          onSubmit={async (payload) => {
            if (editingTemplate) {
              await updateTemplateMutation.mutateAsync({
                id: editingTemplate.id,
                payload: payload as UpdateTemplatePayload,
              });
            } else {
              await createTemplateMutation.mutateAsync(payload as CreateTemplatePayload);
            }
          }}
          initialData={editingTemplate}
          workspaceId={currentWorkspace.id}
        />
      )}

      {/* Field Definition Modal */}
      <FieldDefinitionModal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField(null);
        }}
        onSubmit={handleFieldModalSubmit}
        initialData={editingField}
      />
    </div>
  );
};
