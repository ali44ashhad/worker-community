import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, Plus, Trash2 } from 'lucide-react';
import {
  createEmergencyContact,
  deleteEmergencyContact,
  fetchEmergencyContacts,
} from '../../features/secretarySlice';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:opacity-60';
const btnDelete =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60';

const inputBase =
  'w-full rounded-xl border border-purple-100 bg-white/90 px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100';

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
    {children}
  </label>
);

const ContactCard = ({ contact, deleting, onDelete }) => {
  const tel = contact.phone ? `tel:${contact.phone}` : null;
  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl border border-purple-100/60 bg-white/90 p-5 shadow-sm shadow-purple-500/5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute -right-24 -top-24 h-44 w-44 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 opacity-70 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">{contact.title}</h3>
          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{contact.name || '—'}</p>
          <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{contact.phone}</p>
          {contact.notes ? (
            <p className="mt-2 text-xs text-[var(--text-secondary)]">{contact.notes}</p>
          ) : null}
          <div className="mt-4">
            <a
              href={tel || undefined}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 ${
                tel ? '' : 'pointer-events-none opacity-50'
              }`}
            >
              <PhoneCall className="h-4 w-4 text-[var(--purple-primary)]" />
              Call
            </a>
          </div>
        </div>
        <button type="button" onClick={onDelete} disabled={deleting} className={btnDelete} title="Delete">
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">{deleting ? 'Deleting…' : 'Delete'}</span>
        </button>
      </div>
    </motion.div>
  );
};

const SecretaryContacts = () => {
  const dispatch = useDispatch();
  const {
    emergencyContacts,
    emergencyContactsLoading,
    emergencyContactsError,
    emergencyContactsMeta,
    emergencyContactCreating,
    emergencyContactDeletingId,
  } = useSelector((state) => state.secretary);

  const [form, setForm] = useState({ title: '', name: '', phone: '', notes: '' });

  useEffect(() => {
    dispatch(fetchEmergencyContacts());
  }, [dispatch]);

  const needsCommunName = Boolean(emergencyContactsMeta?.needsCommunName);

  const grouped = useMemo(() => {
    const items = emergencyContacts || [];
    const map = new Map();
    items.forEach((c) => {
      const key = c.title || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [emergencyContacts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
    };
    const created = await dispatch(createEmergencyContact(payload)).unwrap().catch(() => null);
    if (!created) return;
    setForm({ title: '', name: '', phone: '', notes: '' });
  };

  const handleDelete = async (id) => {
    await dispatch(deleteEmergencyContact(id)).unwrap().catch(() => null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
          <PhoneCall className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Emergency contacts</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Add SOS numbers for your community. (No email here.)
          </p>
        </div>
      </div>

      <div className={`${cardClass} mb-7`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">Add contact</h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Examples: Police, SOS, Lift technician, Secretary number, Security, Ambulance.
            </p>
          </div>
          <button type="button" className="rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50" onClick={() => dispatch(fetchEmergencyContacts())} disabled={emergencyContactsLoading}>
            Refresh
          </button>
        </div>

        {needsCommunName && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your secretary account has no Commun handle set. Ask admin to set `communName` on your account.
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Title (required)">
            <input
              className={inputBase}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Police"
              disabled={needsCommunName}
            />
          </Field>
          <Field label="Contact name (optional)">
            <input
              className={inputBase}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Sharma Ji"
              disabled={needsCommunName}
            />
          </Field>
          <Field label="Phone number (required)">
            <input
              className={inputBase}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 100 / 112 / 9876543210"
              disabled={needsCommunName}
            />
          </Field>
          <Field label="Notes (optional)">
            <input
              className={inputBase}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. Available 24x7"
              disabled={needsCommunName}
            />
          </Field>

          <div className="md:col-span-2">
            <button type="submit" className={btnPrimary} disabled={needsCommunName || emergencyContactCreating}>
              <Plus className="h-4 w-4" />
              {emergencyContactCreating ? 'Saving…' : 'Create contact'}
            </button>
          </div>
        </form>

        {emergencyContactsError ? (
          <p className="mt-4 text-sm font-medium text-red-600">{String(emergencyContactsError)}</p>
        ) : null}
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">Saved contacts</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Your community members will see these cards.</p>

        <div className="mt-4 space-y-6">
          {emergencyContactsLoading && (
            <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
              Loading…
            </div>
          )}

          {!emergencyContactsLoading && (emergencyContacts || []).length === 0 && (
            <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
              No emergency contacts added yet.
            </div>
          )}

          <AnimatePresence>
            {grouped.map(([title, items]) => (
              <motion.div key={title} layout className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{items.length} contact(s)</p>
                  </div>
                </div>

                <motion.div layout className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {items.map((c) => (
                    <ContactCard
                      key={c._id}
                      contact={c}
                      deleting={emergencyContactDeletingId === c._id}
                      onDelete={() => handleDelete(c._id)}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default SecretaryContacts;