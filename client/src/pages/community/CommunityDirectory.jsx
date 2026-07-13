import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Mail, MapPin, Phone, PhoneCall, Search, Users, X } from 'lucide-react';
import { fetchCommunityDirectory } from '../../features/communitySlice';
import { formatCommunDisplayName } from '../../utils/communName';
import ProfileAvatar from '../../components/ProfileAvatar';
import {
  formatAddress,
  getFullName,
  getUserFlatNumber,
  getUserStreetAddressLine1,
} from '../../utils/userHelpers';

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 border-b border-purple-50 py-2 last:border-b-0">
    <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
    <span className="max-w-[65%] break-words text-right text-sm text-[var(--text-primary)]">
      {value || '—'}
    </span>
  </div>
);

const CommunityDirectory = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { directoryMembers, directoryLoading, directoryError, directoryMeta } = useSelector(
    (state) => state.community
  );

  const [searchInput, setSearchInput] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const communityHandle = (user?.communityCommunName || '').trim().toLowerCase();
  const communityLabel = communityHandle ? formatCommunDisplayName(communityHandle) : null;

  useEffect(() => {
    if (communityHandle) dispatch(fetchCommunityDirectory());
  }, [dispatch, communityHandle]);

  const filteredMembers = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    const list = [...(directoryMembers || [])];
    const hasFlat = (m) => Boolean(String(m?.flatNumber || '').trim() || getUserFlatNumber(m));
    list.sort((a, b) => {
      const aHas = hasFlat(a);
      const bHas = hasFlat(b);
      // Flat listed first, then unlisted
      if (aHas !== bHas) return aHas ? -1 : 1;
      if (aHas) {
        const flatCmp = String(getUserFlatNumber(a) || a.flatNumber || '').localeCompare(
          String(getUserFlatNumber(b) || b.flatNumber || ''),
          undefined,
          { numeric: true, sensitivity: 'base' }
        );
        if (flatCmp !== 0) return flatCmp;
      }
      return getFullName(a).localeCompare(getFullName(b));
    });
    if (!q) return list;
    return list.filter((m) => {
      const hay = [
        m.firstName,
        m.lastName,
        m.email,
        m.phoneNumber,
        m.flatNumber,
        m.role,
        m.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [directoryMembers, searchInput]);

  const closeProfile = () => setSelectedMember(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">Directories</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {communityLabel
              ? `Members of ${communityLabel}. Tap a person for full details.`
              : 'Members of your joined community. Tap a person for full details.'}
          </p>
        </div>
      </div>

      {(directoryMeta?.needsCommunity || !communityHandle) && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You are not part of a community yet.
        </div>
      )}

      {directoryError ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {String(directoryError)}
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, flat, phone, email…"
            className={inputClass}
            disabled={!communityHandle}
          />
        </div>
        <button
          type="button"
          onClick={() => dispatch(fetchCommunityDirectory())}
          disabled={directoryLoading || !communityHandle}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60"
        >
          <Users className="h-4 w-4 text-[var(--purple-primary)]" />
          Refresh
        </button>
      </div>

      {/* Mobile list */}
      <div className="space-y-2 lg:hidden">
        {directoryLoading ? (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-10 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
            <p className="text-sm text-[var(--text-secondary)]">Loading members…</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-10 text-center text-sm text-[var(--text-secondary)]">
            No members found.
          </div>
        ) : (
          filteredMembers.map((member) => {
            const flat = getUserFlatNumber(member) || member.flatNumber || '—';
            return (
              <button
                key={member._id}
                type="button"
                onClick={() => setSelectedMember(member)}
                className="w-full rounded-2xl border border-purple-100/50 bg-white/80 p-4 text-left shadow-sm shadow-purple-500/5 transition hover:bg-purple-50/40"
              >
                <span className="mb-2 inline-flex rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
                  Flat {flat}
                </span>
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    user={member}
                    alt={getFullName(member)}
                    size="lg"
                    className="border border-[var(--purple-primary)]/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--purple-primary)]">
                      {getFullName(member)}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {member.phoneNumber || 'No phone'} ·{' '}
                      <span className="capitalize">{member.role === 'provider' ? 'Provider' : 'Member'}</span>
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-sm shadow-purple-500/5 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-purple-100 bg-purple-50/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Flat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {directoryLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-purple-100 border-t-[var(--purple-primary)]" />
                    <p className="text-sm text-[var(--text-secondary)]">Loading members…</p>
                  </td>
                </tr>
              )}
              {!directoryLoading && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
                    No members found.
                  </td>
                </tr>
              )}
              {!directoryLoading &&
                filteredMembers.map((member) => {
                  const flat = getUserFlatNumber(member) || member.flatNumber || '—';
                  return (
                    <tr
                      key={member._id}
                      className="cursor-pointer border-b border-purple-50 last:border-b-0 hover:bg-purple-50/40"
                      onClick={() => setSelectedMember(member)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            user={member}
                            alt={getFullName(member)}
                            size="md"
                            className="border border-[var(--purple-primary)]/20"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--purple-primary)] underline-offset-2 hover:underline">
                              {getFullName(member)}
                            </p>
                            <p className="truncate text-xs text-[var(--text-secondary)]">
                              {member.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{flat}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {member.phoneNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-[var(--text-secondary)]">
                        {member.role === 'provider' ? 'Provider' : 'Member'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--text-secondary)]">
        {filteredMembers.length} member{filteredMembers.length === 1 ? '' : 's'}
        {searchInput.trim() ? ' matching your search' : ''}
      </p>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProfile}
            role="dialog"
            aria-modal="true"
            aria-label="Member profile"
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-purple-100 bg-white shadow-xl"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-purple-100 bg-white px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar
                    user={selectedMember}
                    alt={getFullName(selectedMember)}
                    size="lg"
                    className="border border-[var(--purple-primary)]/20"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]">
                      Member profile
                    </p>
                    <h2 className="mt-0.5 truncate text-lg font-semibold text-[var(--text-primary)]">
                      {getFullName(selectedMember)}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeProfile}
                  className="rounded-xl border border-purple-100 p-2 text-[var(--text-secondary)] hover:bg-purple-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-medium capitalize text-[var(--purple-primary)]">
                    {selectedMember.role === 'provider' ? 'Provider' : 'Member'}
                  </span>
                  <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Flat {getUserFlatNumber(selectedMember) || selectedMember.flatNumber || '—'}
                  </span>
                </div>

                <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Contact
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--text-primary)]">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-[var(--purple-primary)]" />
                      <span className="truncate">{selectedMember.phoneNumber || '—'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-[var(--purple-primary)]" />
                      <span className="truncate">{selectedMember.email || '—'}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    <MapPin className="h-3.5 w-3.5" />
                    Address
                  </p>
                  <div className="space-y-1">
                    <DetailRow
                      label="Flat / house"
                      value={getUserFlatNumber(selectedMember) || selectedMember.flatNumber}
                    />
                    <DetailRow label="Street line 1" value={getUserStreetAddressLine1(selectedMember)} />
                    <DetailRow label="Street line 2" value={selectedMember.addressLine2} />
                    <DetailRow label="City" value={selectedMember.city} />
                    <DetailRow label="State" value={selectedMember.state} />
                    <DetailRow label="ZIP" value={selectedMember.zip} />
                    <DetailRow label="Full address" value={formatAddress(selectedMember)} />
                  </div>
                </div>

                {selectedMember.communityCommunName ? (
                  <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Community
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                      {formatCommunDisplayName(selectedMember.communityCommunName)}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2">
                  {selectedMember.phoneNumber ? (
                    <a
                      href={`tel:${selectedMember.phoneNumber}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--purple-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Call
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={closeProfile}
                    className="rounded-xl border border-purple-100 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-purple-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityDirectory;
