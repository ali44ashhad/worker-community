import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunityMembers, updateCommunityMemberStatus } from '../../features/secretarySlice';
import { getFullName } from '../../utils/userHelpers';
import { formatCommunDisplayName } from '../../utils/communName';

const SecretaryMembers = () => {
  const dispatch = useDispatch();
  const { members, membersLoading, membersError, membersMeta } = useSelector((state) => state.secretary);

  useEffect(() => {
    dispatch(fetchCommunityMembers());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Secretary</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Member list</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          People who signed up under your Commun community
          {membersMeta.communityCommunName ? (
            <span className="font-medium text-indigo-600">
              {' '}
              ({formatCommunDisplayName(membersMeta.communityCommunName)})
            </span>
          ) : null}
          . Up to 500 shown, newest first.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {membersMeta.needsCommunName && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This secretary account has no Commun handle. Ask an admin to set your Commun name in Admin → Secretary
            management so members can be matched to you.
          </p>
        )}

        {membersError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{membersError}</p>
        )}

        {membersLoading && members.length === 0 && !membersError ? (
          <p className="mt-8 text-center text-sm text-gray-500">Loading…</p>
        ) : !membersMeta.needsCommunName && members.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-600">
            No members in your community yet. They appear here after they choose your Commun on signup.
          </p>
        ) : members.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Provider @</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 text-right">Change status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((u) => {
                  const status = u.accountStatus || 'approved';
                  const joined = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';
                  return (
                    <tr key={u._id} className="text-gray-800">
                      <td className="py-3 pr-4 font-medium text-gray-900">{getFullName(u)}</td>
                      <td className="py-3 pr-4 text-gray-600">{u.email || '—'}</td>
                      <td className="py-3 pr-4 text-gray-600">{u.phoneNumber || '—'}</td>
                      <td className="py-3 pr-4 capitalize">{u.role || '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            status === 'approved'
                              ? 'bg-green-50 text-green-800'
                              : status === 'pending'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-indigo-600">
                        {u.role === 'provider' && u.communName
                          ? formatCommunDisplayName(u.communName)
                          : '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{joined}</td>
                      <td className="py-3 text-right">
                        <select
                          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          value={status}
                          onChange={(e) => {
                            const next = e.target.value;
                            dispatch(updateCommunityMemberStatus({ userId: u._id, accountStatus: next }));
                          }}
                        >
                          <option value="approved">approved</option>
                          <option value="pending">pending</option>
                          <option value="rejected">rejected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default SecretaryMembers;
