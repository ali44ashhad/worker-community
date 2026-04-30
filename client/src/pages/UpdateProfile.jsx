import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePasswordUser, updateProfile } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineCamera, HiOutlineCheck, HiX } from 'react-icons/hi';

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        phoneNumber: user.phoneNumber || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        zip: user.zip || '',
      });
      setPreviewImage(user.profileImage || '');
      setRemoveProfileImage(false);
      setProfileImage(null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digitsOnly = String(value || '').replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      setRemoveProfileImage(false); // Clear removal flag when uploading new image
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const currentPassword = String(passwordForm.currentPassword || '').trim();
    const newPassword = String(passwordForm.newPassword || '').trim();
    const confirmNewPassword = String(passwordForm.confirmNewPassword || '').trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password should be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password.');
      return;
    }

    try {
      const data = await dispatch(changePasswordUser({ currentPassword, newPassword })).unwrap();
      toast.success(data?.message || 'Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setShowPasswords({ current: false, next: false, confirm: false });
    } catch (error) {
      toast.error(error || 'Failed to update password');
    }
  };

  const handleRemoveImage = () => {
    // If there's a newly uploaded image, just remove it locally
    if (profileImage) {
      setProfileImage(null);
      setPreviewImage(user?.profileImage || '');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } 
    // If there's an existing profile image, toggle removal state
    else if (user?.profileImage) {
      if (removeProfileImage) {
        // Undo removal
        setRemoveProfileImage(false);
        setPreviewImage(user.profileImage);
      } else {
        // Mark for removal
        setRemoveProfileImage(true);
        setPreviewImage('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.phoneNumber) {
        const phoneDigits = String(formData.phoneNumber || '').replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          toast.error('Enter a valid phone number (10 digits).');
          return;
        }
      }
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('addressLine1', formData.addressLine1);
      formDataToSend.append('addressLine2', formData.addressLine2);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('zip', formData.zip);
      
      if (removeProfileImage) {
        formDataToSend.append('removeProfileImage', 'true');
      } else if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const data = await dispatch(updateProfile(formDataToSend)).unwrap();
      
      if (data.success) {
        toast.success('Profile updated successfully');
        navigate('/');
      }
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Please Login First</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to update your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Update Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your personal information and profile picture
          </p>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl shadow-2xl overflow-hidden">
          {/* Profile Image Section */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-8 py-10 border-b-2 border-black">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                {/* Profile Image */}
                <div className="w-40 h-40 rounded-full border-4 border-black overflow-hidden bg-white shadow-lg">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <HiOutlineUser className="text-5xl text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Camera Icon Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-black text-white p-3 rounded-full border-4 border-white shadow-lg hover:bg-gray-800 transition-all hover:scale-110"
                >
                  <HiOutlineCamera className="text-xl" />
                </button>
              </div>

              {/* File Input (Hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="text-sm text-gray-600 max-w-md text-center mb-4">
                Click the camera icon to upload a new profile picture
              </p>
              {user?.profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    removeProfileImage 
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300 hover:bg-orange-200' 
                      : 'bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200'
                  }`}
                >
                  {removeProfileImage ? 'Profile picture will be removed (click to undo)' : 'Remove Profile Picture'}
                </button>
              )}
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* First Name Input */}
            <div className="mb-6">
              <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                First Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full h-14 pl-12 pr-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                />
              </div>
            </div>

            {/* Last Name Input */}
            <div className="mb-6">
              <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                Last Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full h-14 pl-12 pr-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="mb-6">
              <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full h-14 pl-12 pr-4 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone Number Input */}
            <div className="mb-8">
              <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full h-14 pl-12 pr-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                />
              </div>
            </div>

            {/* Address Inputs */}
            <div className="mb-8">
              <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                Address <span className="text-gray-400 font-bold normal-case">(optional)</span>
              </label>
              
              <div className="space-y-4">
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Address Line 1"
                  className="w-full h-14 px-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
                
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Address Line 2 (optional)"
                  className="w-full h-14 px-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full h-14 px-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                  
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full h-14 px-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                  
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="ZIP Code"
                    className="w-full h-14 px-4 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 h-14 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <HiOutlineCheck size={20} />
                    <span>Update Profile</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="px-6 h-14 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Change Password Section */}
          <div className="border-t-2 border-black bg-white p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black">Change Password</h2>
              <p className="text-sm text-gray-600 mt-1">
                Update your password to keep your account secure.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full h-14 px-4 pr-16 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    {showPasswords.current ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.next ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Min 8 characters"
                      className="w-full h-14 px-4 pr-16 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, next: !p.next }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      {showPasswords.next ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-semibold mb-2 text-sm uppercase tracking-wide">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      className="w-full h-14 px-4 pr-16 border-2 border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      {showPasswords.confirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Tip: Use a strong password (mix letters, numbers, symbols).
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Your profile information helps others connect with you on our platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;