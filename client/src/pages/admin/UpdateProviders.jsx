import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllProvidersAdmin, 
  updateProviderDetails, 
  updateProviderUserDetails 
} from '../../features/adminSlice';
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const UpdateProviders = () => {
  const dispatch = useDispatch();
  const { providers, isLoading, error } = useSelector((state) => state.admin);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editForm, setEditForm] = useState({
    bio: '',
    name: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    dispatch(getAllProvidersAdmin());
  }, [dispatch]);

  const handleEdit = (provider) => {
    setEditingProvider(provider._id);
    setEditForm({
      bio: provider.bio || '',
      name: provider.user?.name || '',
      email: provider.user?.email || '',
      phoneNumber: provider.user?.phoneNumber || '',
    });
  };

  const handleCancel = () => {
    setEditingProvider(null);
    setEditForm({
      bio: '',
      name: '',
      email: '',
      phoneNumber: '',
    });
  };

  const handleSave = async (providerId) => {
    // Update provider bio
    if (editForm.bio !== undefined) {
      await dispatch(updateProviderDetails({ providerId, bio: editForm.bio }));
    }

    // Update user details
    await dispatch(
      updateProviderUserDetails({
        providerId,
        name: editForm.name,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
      })
    );

    setEditingProvider(null);
    setEditForm({
      bio: '',
      name: '',
      email: '',
      phoneNumber: '',
    });

    // Refresh providers list
    dispatch(getAllProvidersAdmin());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading providers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Providers</h1>
        <p className="text-gray-600 mt-2">View and update provider information</p>
      </div>

      {providers && providers.length > 0 ? (
        <div className="space-y-6">
          {providers.map((provider) => {
            const isEditing = editingProvider === provider._id;

            return (
              <div
                key={provider._id}
                className="bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {provider.user?.profileImage ? (
                        <img
                          src={provider.user.profileImage}
                          alt={provider.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-xl">
                          {provider.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {provider.user?.name || 'Unknown Provider'}
                      </h3>
                      <p className="text-sm text-gray-600">{provider.user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(provider)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <HiOutlinePencil size={18} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(provider._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <HiOutlineCheck size={18} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <HiOutlineX size={18} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                      ) : (
                        <p className="text-gray-900">{provider.user?.name || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                      ) : (
                        <p className="text-gray-900">{provider.user?.email || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phoneNumber: e.target.value })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                      ) : (
                        <p className="text-gray-900">{provider.user?.phoneNumber || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows="4"
                        maxLength={500}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        placeholder="Provider bio..."
                      />
                    ) : (
                      <p className="text-gray-900">{provider.bio || 'No bio provided'}</p>
                    )}
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {editForm.bio.length}/500 characters
                      </p>
                    )}
                  </div>

                  {/* Service Offerings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Offerings
                    </label>
                    {provider.serviceOfferings && provider.serviceOfferings.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {provider.serviceOfferings.map((service) => (
                          <span
                            key={service._id}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                          >
                            {service.serviceCategory}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No services added yet</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border-2 border-black rounded-xl p-12 text-center">
          <p className="text-gray-600 text-lg">No providers found</p>
        </div>
      )}
    </div>
  );
};

export default UpdateProviders;
