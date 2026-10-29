import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Link2,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Loader2,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { api, Note, Resource, CreateNotePayload } from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { NoteModal, NoteFormValues } from './NoteModal';
import { ResourceModal } from './ResourceModal';

export function NotesPage() {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'notes' | 'resources'>('notes');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Fetch Notes
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ['notes', currentWorkspace?.id, search],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.notes.list(currentWorkspace.id, search || undefined);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Fetch Resources
  const { data: resources = [], isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ['resources', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.resources.list(currentWorkspace.id);
      return res.data;
    },
    enabled: !!currentWorkspace?.id,
  });

  // Collect unique tags across notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const note of notes) {
      if (note.tags) {
        note.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .forEach((t) => tagSet.add(t));
      }
    }
    return Array.from(tagSet);
  }, [notes]);

  // Filter notes by selected tag
  const filteredNotes = useMemo(() => {
    if (!selectedTag) return notes;
    return notes.filter((note) => {
      if (!note.tags) return false;
      const tags = note.tags.split(',').map((t) => t.trim().toLowerCase());
      return tags.includes(selectedTag.toLowerCase());
    });
  }, [notes, selectedTag]);

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => api.notes.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsNoteModalOpen(false);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NoteFormValues }) =>
      api.notes.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsNoteModalOpen(false);
      setEditingNote(null);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.notes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (viewingNote) setViewingNote(null);
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: (payload: { name: string; url: string; resourceType?: string }) =>
      api.resources.create({
        workspaceId: currentWorkspace!.id,
        name: payload.name,
        url: payload.url,
        resourceType: payload.resourceType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setIsResourceModalOpen(false);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => api.resources.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const handleSaveNote = async (values: NoteFormValues) => {
    if (!currentWorkspace?.id) return;
    if (editingNote) {
      await updateNoteMutation.mutateAsync({
        id: editingNote.id,
        payload: values,
      });
    } else {
      await createNoteMutation.mutateAsync({
        workspaceId: currentWorkspace.id,
        title: values.title,
        content: values.content,
        tags: values.tags,
      });
    }
  };

  const handleCopyNoteContent = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Notes & Knowledge
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Capture study summaries, key concepts, cheat sheets, and external reference links.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Note
          </button>
          <button
            onClick={() => setIsResourceModalOpen(true)}
            className="inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 rounded-xl shadow-xs transition-all"
          >
            <Link2 className="w-4 h-4 mr-1.5 text-sky-600" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notes
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
            {notes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'resources'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Link2 className="w-4 h-4" />
          External Resources
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
            {resources.length}
          </span>
        </button>
      </div>

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Search & Tag Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes by title, content, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  Tags:
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedTag === null
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Tags
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Grid */}
          {isLoadingNotes ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No notes found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {notes.length === 0
                  ? 'Start building your engineering second brain. Document tricky concepts, algorithms, and architectures.'
                  : 'No notes match your current search or tag filter.'}
              </p>
              <button
                onClick={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => setViewingNote(note)}
                        className="text-base font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                      >
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingNote(note);
                            setIsNoteModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this note?')) {
                              deleteNoteMutation.mutate(note.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {note.content && (
                      <p
                        onClick={() => setViewingNote(note)}
                        className="text-xs text-slate-600 line-clamp-4 leading-relaxed cursor-pointer font-sans"
                      >
                        {note.content}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    {note.tags && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.split(',').map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-indigo-50 text-indigo-700"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setViewingNote(note)}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          {isLoadingResources ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No resources linked</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save external documentation, video tutorials, articles, or reference links.
              </p>
              <button
                onClick={() => setIsResourceModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add First Resource
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {resources.map((resource: Resource) => (
                  <div
                    key={resource.id}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition-colors gap-4"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl shrink-0">
                        <Link2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {resource.name}
                          </h4>
                          {resource.resourceType && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 uppercase">
                              {resource.resourceType}
                            </span>
                          )}
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <span className="truncate">{resource.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this resource?')) {
                            deleteResourceMutation.mutate(resource.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Reader Modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 truncate max-w-md">
                  {viewingNote.title}
                </h3>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleCopyNoteContent(viewingNote.content || '', viewingNote.id)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Copy content"
                >
                  {copiedNoteId === viewingNote.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setViewingNote(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {viewingNote.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {viewingNote.tags.split(',').map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {viewingNote.content || 'No content written in this note.'}
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100">
                <span>Created {new Date(viewingNote.createdAt).toLocaleString()}</span>
                <span>Last updated {new Date(viewingNote.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-100 gap-2">
              <button
                onClick={() => {
                  const toEdit = viewingNote;
                  setViewingNote(null);
                  setEditingNote(toEdit);
                  setIsNoteModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Edit Note
              </button>
              <button
                onClick={() => setViewingNote(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSubmit={handleSaveNote}
        initialData={editingNote}
      />

      {/* Resource Modal */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSubmit={async (values) => {
          await createResourceMutation.mutateAsync(values);
        }}
      />
    </div>
  );
}
