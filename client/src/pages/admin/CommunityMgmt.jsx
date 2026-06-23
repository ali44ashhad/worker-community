import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Plus, ToggleRight } from 'lucide-react';
import {
  fetchAdminInterestCommunities,
  createAdminInterestCommunity,
  toggleAdminInterestCommunity,
} from '../../features/interestCommunitySlice';
import ToggleSwitch from '../../components/ToggleSwitch';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const CommunityMgmt = () => {
  const dispatch = useDispatch();
  const { adminCommunities, adminLoading, adminSaving } = useSelector(
    (state) => state.interestCommunity
  );
  const [name, setName] = useState('');

  useEffect(() => {
    dispatch(fetchAdminInterestCommunities());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const result = await dispatch(createAdminInterestCommunity(trimmed));
    if (!result.error) setName('');
  };

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Community Mgmt
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create interest communities (e.g. Cricket, Yoga). Members from the same Commun can chat
            in real time.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
        <form onSubmit={handleCreate} className={cardClass}>
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                Create community
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Name only — e.g. Cricket</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Community name"
              className="flex-1 rounded-xl border border-purple-100 px-4 py-3 text-sm focus:border-[var(--purple-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/20"
              maxLength={80}
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>

        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-2">
            <ToggleRight className="h-4 w-4 text-[var(--purple-primary)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">All communities</h2>
          </div>

          {adminLoading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
          ) : adminCommunities.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No communities yet.</p>
          ) : (
            <div className="space-y-3">
              {adminCommunities.map((c) => (
                <div
                  key={c._id}
                  className="flex flex-col gap-3 rounded-xl border border-purple-100/70 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-[var(--purple-primary)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{c.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {c.memberCount || 0} total members
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={Boolean(c.isActive)}
                    label={`${c.name} ${c.isActive ? 'on' : 'off'}`}
                    disabled={adminSaving}
                    onToggle={() =>
                      dispatch(toggleAdminInterestCommunity({ id: c._id, isActive: !c.isActive }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityMgmt;
