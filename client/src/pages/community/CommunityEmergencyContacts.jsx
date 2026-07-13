import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, ShieldAlert } from 'lucide-react';
import { fetchCommunityEmergencyContacts } from '../../features/communitySlice';
import { formatCommunDisplayName } from '../../utils/communName';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60';

const ContactCard = ({ contact }) => {
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
      <div className="relative">
        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">{contact.title}</h3>
        {contact.name ? (
          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{contact.name}</p>
        ) : null}
        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{contact.phone}</p>
        {contact.notes ? <p className="mt-2 text-xs text-[var(--text-secondary)]">{contact.notes}</p> : null}
        <div className="mt-4">
          <a
            href={tel || undefined}
            className={`${btnGhost} ${tel ? '' : 'pointer-events-none opacity-50'}`}
          >
            <PhoneCall className="h-4 w-4 text-[var(--purple-primary)]" />
            Call
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const CommunityEmergencyContacts = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { emergencyContacts, emergencyContactsLoading, emergencyContactsError, emergencyContactsMeta } = useSelector(
    (state) => state.community
  );

  const communityHandle = (user?.communityCommunName || '').trim().toLowerCase();
  const communityLabel = communityHandle ? formatCommunDisplayName(communityHandle) : null;

  useEffect(() => {
    if (communityHandle) dispatch(fetchCommunityEmergencyContacts());
  }, [dispatch, communityHandle]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Emergency contacts</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {communityLabel ? `Showing contacts for ${communityLabel}.` : 'Emergency contacts are available for your joined community.'}
          </p>
        </div>
      </div>

      {(emergencyContactsMeta?.needsCommunity || !communityHandle) && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You are not part of a community yet.
        </div>
      )}

      {emergencyContactsError ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {String(emergencyContactsError)}
        </div>
      ) : null}

      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">SOS numbers</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">These are added by your community secretary.</p>
          </div>
          <button type="button" className={btnGhost} onClick={() => dispatch(fetchCommunityEmergencyContacts())} disabled={emergencyContactsLoading}>
            Refresh
          </button>
        </div>

        <div className="mt-4">
          {emergencyContactsLoading && (
            <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
              Loading…
            </div>
          )}
          {!emergencyContactsLoading && (emergencyContacts || []).length === 0 && (
            <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
              No emergency contacts available right now.
            </div>
          )}

          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {(emergencyContacts || []).map((c) => (
                <ContactCard key={c._id} contact={c} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CommunityEmergencyContacts;

