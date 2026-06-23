import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Users } from 'lucide-react';
import {
  fetchInterestCommunities,
  joinInterestCommunity,
} from '../../features/interestCommunitySlice';

const InterestCommunities = ({ chatBasePath = '/interest-communities' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { communities, communLabel, needsCommunName, loading, joiningId } = useSelector(
    (state) => state.interestCommunity
  );

  useEffect(() => {
    dispatch(fetchInterestCommunities());
  }, [dispatch]);

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Communities
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Interest Communities
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Join a community and chat with neighbours from your Commun
            {communLabel ? (
              <span className="font-medium text-[var(--purple-primary)]"> ({communLabel})</span>
            ) : null}
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {needsCommunName && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            Link your account to a Commun locality first to join communities.
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading communities…</p>
        ) : communities.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No communities available yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {communities.map((c) => (
              <div
                key={c._id}
                className="flex flex-col rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100">
                    <MessageCircle className="h-5 w-5 text-[var(--purple-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">{c.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <Users className="h-3.5 w-3.5" />
                      {c.memberCount} from your Commun
                    </p>
                  </div>
                </div>

                {c.joined ? (
                  <Link
                    to={`${chatBasePath}/${c._id}/chat`}
                    className="mt-auto rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Open Chat
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={needsCommunName || joiningId === c._id}
                    onClick={async () => {
                      const result = await dispatch(joinInterestCommunity(c._id));
                      if (!result.error) navigate(`${chatBasePath}/${c._id}/chat`);
                    }}
                    className="mt-auto rounded-xl border-2 border-[var(--purple-primary)] py-2.5 text-sm font-semibold text-[var(--purple-primary)] transition-colors hover:bg-purple-50 disabled:opacity-50"
                  >
                    {joiningId === c._id ? 'Joining…' : 'Join'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InterestCommunities;
