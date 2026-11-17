import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, MapPin, Monitor, Plus, RotateCcw, Save, Smartphone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAdminLocality,
  deleteAdminLocality,
  fetchAdminLocalities,
  updateAdminLocality,
} from '../../features/adminSlice';
import LocalitiesMap from '../../components/home/LocalitiesMap';

const inputClass =
  'w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)]';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50';

const draftFromLocality = (loc) => ({
  name: loc.name || '',
  status: loc.status === 'active' ? 'active' : 'comingSoon',
  x: Number(loc.x) || 50,
  y: Number(loc.y) || 50,
  isVisible: loc.isVisible !== false,
});

const isDraftDifferent = (loc, draft) => {
  if (!loc || !draft) return false;
  return (
    String(draft.name || '').trim() !== String(loc.name || '').trim() ||
    draft.status !== loc.status ||
    Number(draft.x) !== Number(loc.x) ||
    Number(draft.y) !== Number(loc.y) ||
    Boolean(draft.isVisible) !== (loc.isVisible !== false)
  );
};

const AdminLocalities = () => {
  const dispatch = useDispatch();
  const { localities, localitiesLoading, localitySaving } = useSelector((state) => state.admin);

  const [selectedId, setSelectedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState('comingSoon');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [previewViewport, setPreviewViewport] = useState('desktop');

  useEffect(() => {
    dispatch(fetchAdminLocalities());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedId && localities?.length) {
      setSelectedId(localities[0]._id);
    }
  }, [localities, selectedId]);

  const dirtyIds = useMemo(() => {
    return (localities || [])
      .filter((loc) => isDraftDifferent(loc, drafts[loc._id]))
      .map((loc) => loc._id);
  }, [localities, drafts]);

  const hasUnsavedChanges = dirtyIds.length > 0;

  const displayLocalities = useMemo(() => {
    return (localities || [])
      .map((l) => {
        const draft = drafts[l._id];
        const merged = draft ? { ...l, ...draft } : l;
        return merged;
      })
      .filter((l) => l.isVisible !== false);
  }, [localities, drafts]);

  const selected = useMemo(
    () => (localities || []).find((l) => l._id === selectedId) || null,
    [localities, selectedId]
  );

  const selectedDraft = useMemo(() => {
    if (!selected) return null;
    return drafts[selected._id] || draftFromLocality(selected);
  }, [selected, drafts]);

  const patchDraft = (id, patch) => {
    const base = (localities || []).find((l) => l._id === id);
    if (!base) return;
    setDrafts((prev) => {
      const current = prev[id] || draftFromLocality(base);
      const next = { ...current, ...patch };
      if (!isDraftDifferent(base, next)) {
        const cleared = { ...prev };
        delete cleared[id];
        return cleared;
      }
      return { ...prev, [id]: next };
    });
  };

  const onPositionChange = (id, x, y) => {
    patchDraft(id, { x, y });
  };

  const discardChanges = () => {
    setDrafts({});
  };

  const saveChanges = async () => {
    if (!dirtyIds.length) return;
    try {
      for (const id of dirtyIds) {
        const loc = (localities || []).find((l) => l._id === id);
        const draft = drafts[id];
        if (!loc || !draft) continue;
        const name = String(draft.name || '').trim();
        if (!name) {
          toast.error('Locality name cannot be empty.');
          setSelectedId(id);
          return;
        }
        await dispatch(
          updateAdminLocality({
            localityId: id,
            data: {
              name,
              status: draft.status,
              x: draft.x,
              y: draft.y,
              isVisible: draft.isVisible,
            },
          })
        ).unwrap();
      }
      setDrafts({});
      toast.success(
        dirtyIds.length === 1
          ? 'Locality saved.'
          : `${dirtyIds.length} localities saved.`
      );
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not save changes.');
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      toast.error('Save or discard edits before adding a new locality.');
      return;
    }
    const name = newName.trim();
    if (!name) return;
    const result = await dispatch(
      createAdminLocality({
        name,
        status: newStatus,
        x: 50,
        y: 50,
        sortOrder: (localities?.length || 0) + 1,
      })
    );
    if (createAdminLocality.fulfilled.match(result)) {
      setNewName('');
      setNewStatus('comingSoon');
      const created = result.payload;
      if (created?._id) setSelectedId(created._id);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    if (hasUnsavedChanges) {
      toast.error('Save or discard edits before deleting.');
      return;
    }
    const result = await dispatch(deleteAdminLocality(deleteTarget._id));
    if (deleteAdminLocality.fulfilled.match(result)) {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[deleteTarget._id];
        return next;
      });
      if (selectedId === deleteTarget._id) setSelectedId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6"
      >
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
          Admin
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
          Localities Map
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Edit pins on the preview, then click Save. Nothing is published until you save.
        </p>
      </motion.div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPreviewMode((v) => !v)}
          className={btnSecondary}
        >
          <Eye className="h-4 w-4" />
          {previewMode ? 'Hide preview' : 'Show preview'}
        </button>

        {previewMode && (
          <div className="inline-flex rounded-xl border border-purple-100 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setPreviewViewport('desktop')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                previewViewport === 'desktop'
                  ? 'bg-[var(--purple-primary)] text-white'
                  : 'text-[var(--text-primary)] hover:bg-purple-50'
              }`}
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport('mobile')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                previewViewport === 'mobile'
                  ? 'bg-[var(--purple-primary)] text-white'
                  : 'text-[var(--text-primary)] hover:bg-purple-50'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={discardChanges}
          disabled={!hasUnsavedChanges || localitySaving}
          className={btnSecondary}
        >
          <RotateCcw className="h-4 w-4" />
          Discard
        </button>
        <button
          type="button"
          onClick={saveChanges}
          disabled={!hasUnsavedChanges || localitySaving}
          className={btnPrimary}
        >
          <Save className="h-4 w-4" />
          {localitySaving ? 'Saving…' : hasUnsavedChanges ? `Save changes (${dirtyIds.length})` : 'Save changes'}
        </button>
        {hasUnsavedChanges && (
          <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
        )}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {previewMode && (
          <div className="h-fit self-start rounded-3xl border border-purple-100/60 bg-gradient-to-br from-[var(--purple-primary)] via-[var(--purple-secondary)] to-[var(--purple-primary)] p-4 text-white shadow-sm sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">
                Live preview · {previewViewport === 'mobile' ? 'Mobile' : 'Desktop'}
              </h2>
              <span className="text-[11px] text-white/80">
                {hasUnsavedChanges ? 'Draft preview — not saved yet' : 'Same map as home page'}
              </span>
            </div>
            {localitiesLoading ? (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-white/10 text-sm text-white/80">
                Loading map…
              </div>
            ) : (
              <LocalitiesMap
                localities={displayLocalities}
                interactive
                viewport={previewViewport}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onPositionChange={onPositionChange}
              />
            )}
          </div>
        )}

        <div className="space-y-4">
          <form
            onSubmit={onCreate}
            className="rounded-2xl border border-purple-100/60 bg-white/80 p-4 shadow-sm shadow-purple-500/5"
          >
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Add locality</h2>
            <div className="space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Defence Colony"
                className={inputClass}
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={inputClass}
              >
                <option value="active">Active Now</option>
                <option value="comingSoon">Coming Soon</option>
              </select>
              <button type="submit" disabled={!newName.trim() || localitySaving} className={btnPrimary}>
                <Plus className="h-4 w-4" />
                Add pin
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-purple-100/60 bg-white/80 p-4 shadow-sm shadow-purple-500/5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">All localities</h2>
            {localitiesLoading ? (
              <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
            ) : !localities?.length ? (
              <p className="text-sm text-[var(--text-secondary)]">No localities yet.</p>
            ) : (
              <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                {localities.map((loc) => {
                  const draft = drafts[loc._id];
                  const view = draft ? { ...loc, ...draft } : loc;
                  const isSelected = loc._id === selectedId;
                  const dirty = Boolean(draft);
                  return (
                    <li key={loc._id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(loc._id)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                          isSelected
                            ? 'border-[var(--purple-primary)] bg-purple-50'
                            : 'border-purple-100 hover:bg-purple-50/60'
                        }`}
                      >
                        <MapPin
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            view.status === 'active' ? 'text-fuchsia-500' : 'text-purple-300'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {view.name}
                            {dirty ? (
                              <span className="ml-1 text-[10px] font-semibold text-amber-600">
                                • edited
                              </span>
                            ) : null}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            {view.status === 'active' ? 'Active Now' : 'Coming Soon'} · x {view.x}% · y{' '}
                            {view.y}%
                            {view.isVisible === false ? ' · Hidden' : ''}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {selected && selectedDraft && (
            <div className="rounded-2xl border border-purple-100/60 bg-white/80 p-4 shadow-sm shadow-purple-500/5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Edit selected</h2>
                {dirtyIds.includes(selected._id) && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Unsaved
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                    Name
                  </span>
                  <input
                    value={selectedDraft.name}
                    onChange={(e) => patchDraft(selected._id, { name: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                    Status
                  </span>
                  <select
                    value={selectedDraft.status}
                    onChange={(e) => patchDraft(selected._id, { status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="active">Active Now</option>
                    <option value="comingSoon">Coming Soon</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      X %
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={selectedDraft.x}
                      onChange={(e) => patchDraft(selected._id, { x: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      Y %
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={selectedDraft.y}
                      onChange={(e) => patchDraft(selected._id, { y: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={selectedDraft.isVisible}
                    onChange={(e) => patchDraft(selected._id, { isVisible: e.target.checked })}
                    className="rounded border-purple-200 text-[var(--purple-primary)] focus:ring-[var(--purple-primary)]"
                  />
                  Visible on home page
                </label>

                <p className="text-[11px] text-[var(--text-secondary)]">
                  Use the Save / Discard buttons at the top after editing.
                </p>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(selected)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete locality
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete locality?</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Remove <span className="font-medium text-[var(--text-primary)]">{deleteTarget.name}</span>{' '}
                from the map. This cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" className={btnSecondary} onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLocalities;
