import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import { getAllUsersAdmin, updateUserStatusAdmin } from '../../features/adminSlice';
import { getFullName, getInitials } from '../../utils/userHelpers';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, usersPagination, isLoading } = useSelector((state) => state.admin);
  const authUser = useSelector((state) => state.auth.user);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(getAllUsersAdmin({ page: currentPage, limit: pageSize, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const onToggleStatus = async (user) => {
    if (updatingUserId) return;
    try {
      setUpdatingUserId(user._id);
      await dispatch(updateUserStatusAdmin({ userId: user._id, isActive: !user.isActive })).unwrap();
    } finally {
      setUpdatingUserId(null);
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
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Activate or deactivate user accounts.</p>
      </motion.div>

      <div className="mb-5 relative max-w-md">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email, role, phone"
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs uppercase tracking-wide text-gray-500 px-4 py-3">User</th>
                <th className="text-left text-xs uppercase tracking-wide text-gray-500 px-4 py-3">Email</th>
                <th className="text-left text-xs uppercase tracking-wide text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs uppercase tracking-wide text-gray-500 px-4 py-3">Status</th>
                <th className="text-right text-xs uppercase tracking-wide text-gray-500 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={getFullName(user)} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-semibold flex items-center justify-center">
                          {getInitials(user)}
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{getFullName(user)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.isActive === false
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={updatingUserId === user._id || authUser?._id === user._id}
                      onClick={() => onToggleStatus(user)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        user.isActive === false
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingUserId === user._id
                        ? 'Updating...'
                        : user.isActive === false
                          ? 'Activate'
                          : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Page {usersPagination?.currentPage || 1} of {usersPagination?.totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!usersPagination?.hasPrevPage}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!usersPagination?.hasNextPage}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

