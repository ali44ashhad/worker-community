import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Camera,
  Check,
  Eye,
  EyeOff,
  MapPin,
  LockKeyhole,
  ArrowLeft,
  Building2,
  X,
} from 'lucide-react';
import { changePasswordUser, joinCommunity, updateProfile } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { getApiBase } from '../utils/apiBase';
import { formatCommunDisplayName } from '../utils/communName';
import {
  getInitials,
  getUserCommunityLabel,
  getUserFlatNumber,
  getUserStreetAddressLine1,
} from '../utils/userHelpers';

const inputClass =
  'w-full px-3.5 py-2.5 text-sm border border-purple-100 rounded-xl bg-white text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--purple-primary)]/25 focus:border-[var(--purple-primary)] transition-all';

const inputDisabled =
  'w-full px-3.5 py-2.5 text-sm border border-purple-100 rounded-xl bg-purple-50/50 text-[var(--text-secondary)] cursor-not-allowed';

const Section = ({ title, description, children, icon: Icon }) => (
  <div className="rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6">
    {(title || description) && (
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          {title && <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">{title}</h2>}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
      </div>
    )}
    {children}
  </div>
);

const Field = ({ label, htmlFor, optional, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
      {label}
      {optional && <span className="font-normal text-[var(--text-secondary)]/70"> (optional)</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-[11px] text-[var(--text-secondary)]/80">{hint}</p>}
  </div>
);

const PasswordField = ({ id, label, value, onChange, show, onToggle, autoComplete }) => (
  <Field label={label} htmlFor={id}>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        name={id}
        value={value}
        onChange={onChange}
        className={`${inputClass} pr-10`}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--purple-primary)]"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  </Field>
);

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const isPanelRoute =
    /^\/(admin|provider|secretary)\//.test(location.pathname) ||
    location.pathname === '/community/update-profile';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    flatNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [showJoinCommunity, setShowJoinCommunity] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [joiningCommunity, setJoiningCommunity] = useState(false);
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
        flatNumber: getUserFlatNumber(user),
        addressLine1: getUserStreetAddressLine1(user),
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

  useEffect(() => {
    if (!showJoinCommunity) return undefined;
    const base = getApiBase() || '';
    let cancelled = false;
    setCommunitiesLoading(true);
    (async () => {
      try {
        const res = await fetch(`${base}/api/user/signup-communities`);
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data?.communities)) {
          setCommunities(json.data.communities);
        } else {
          setCommunities([]);
        }
      } catch {
        if (!cancelled) setCommunities([]);
      } finally {
        if (!cancelled) setCommunitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showJoinCommunity]);

  const communityLabel = getUserCommunityLabel(user);

  const handleJoinCommunity = async (e) => {
    e.preventDefault();
    if (!selectedCommunity) {
      toast.error('Please select a community.');
      return;
    }
    setJoiningCommunity(true);
    try {
      const data = await dispatch(joinCommunity(selectedCommunity)).unwrap();
      toast.success(data?.message || 'Join request submitted.');
      setShowJoinCommunity(false);
      setSelectedCommunity('');
      if (data?.user?.accountStatus === 'pending') {
        navigate('/pending-approval');
      }
    } catch (error) {
      toast.error(error || 'Could not join community.');
    } finally {
      setJoiningCommunity(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digitsOnly = String(value || '')
        .replace(/\D/g, '')
        .slice(0, 10);
      setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      setRemoveProfileImage(false);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
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
    if (profileImage) {
      setProfileImage(null);
      setPreviewImage(user?.profileImage || '');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (user?.profileImage) {
      if (removeProfileImage) {
        setRemoveProfileImage(false);
        setPreviewImage(user.profileImage);
      } else {
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
      formDataToSend.append('flatNumber', formData.flatNumber);
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
      <div className="home-page flex min-h-screen items-center justify-center bg-[var(--background-subtle)] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-purple-100/50 bg-white/80 p-8 text-center shadow-lg shadow-purple-500/5">
          <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Please sign in</h2>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            You need to be logged in to update your profile.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <motion.div
      className="home-page min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section
        className={`border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 pb-8 ${
          isPanelRoute ? 'pt-6' : 'pt-6 sm:pt-8'
        }`}
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--purple-primary)] hover:text-[var(--magenta)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Account settings
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Profile</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Update your details and manage account security.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        {/* Profile photo */}
        <Section title="Profile photo" description="JPG or PNG, max 5MB." icon={Camera}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--purple-primary)]/30 bg-purple-50 sm:h-28 sm:w-28">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-semibold text-[var(--purple-primary)]">
                    {getInitials(user)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white shadow-md transition-transform hover:scale-105"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-purple-100 px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50"
              >
                Upload new photo
              </button>
              {user?.profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={`text-xs font-medium transition-colors ${
                    removeProfileImage
                      ? 'text-amber-600 hover:text-amber-700'
                      : 'text-red-500 hover:text-red-600'
                  }`}
                >
                  {removeProfileImage ? 'Undo removal' : 'Remove photo'}
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* Personal info */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="Personal information" description="Your basic contact details." icon={User}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name" htmlFor="firstName">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className={inputClass}
                    required
                  />
                </Field>
              </div>

              <Field label="Community" htmlFor="communityDisplay">
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
                  <input
                    id="communityDisplay"
                    type="text"
                    value={
                      communityLabel ||
                      (user.isPublicMember ? 'Public member (not linked)' : 'Not set')
                    }
                    disabled
                    className={`${inputDisabled} pl-9`}
                  />
                </div>
                {user.isPublicMember && user.requestedCommunityName && (
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]/80">
                    You signed up with: {user.requestedCommunityName}
                  </p>
                )}
              </Field>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className={`${inputDisabled} pl-9`}
                  />
                </div>
                <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)]/80">
                  <span>Email cannot be changed.</span>
                  {user.isPublicMember && (
                    <button
                      type="button"
                      onClick={() => setShowJoinCommunity(true)}
                      className="shrink-0 font-semibold text-[var(--purple-primary)] transition-colors hover:text-[var(--magenta)]"
                    >
                      Join community
                    </button>
                  )}
                </p>
              </div>

              <Field label="Phone number" htmlFor="phoneNumber">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]/60" />
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className={`${inputClass} pl-9`}
                    required
                  />
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Flat number" description="Your flat or house number in the community." icon={Building2}>
            <Field label="Flat / house number" htmlFor="flatNumber">
              <input
                id="flatNumber"
                type="text"
                name="flatNumber"
                value={formData.flatNumber}
                onChange={handleChange}
                placeholder="e.g. A-101, Block 2"
                className={inputClass}
              />
            </Field>
          </Section>

          <Section title="Address" description="Optional — street address (flat number is separate above)." icon={MapPin}>
            <div className="space-y-4">
              <Field label="Address line 1" htmlFor="addressLine1" optional>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Street address"
                  className={inputClass}
                />
              </Field>
              <Field label="Address line 2" htmlFor="addressLine2" optional>
                <input
                  id="addressLine2"
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc."
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="City" htmlFor="city" optional>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={inputClass}
                  />
                </Field>
                <Field label="State" htmlFor="state" optional>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={inputClass}
                  />
                </Field>
                <Field label="ZIP" htmlFor="zip" optional>
                  <input
                    id="zip"
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="ZIP"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="rounded-xl border border-purple-100 px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Password */}
        <Section title="Password" description="Use a strong password you don't use elsewhere." icon={LockKeyhole}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordField
              id="currentPassword"
              label="Current password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              show={showPasswords.current}
              onToggle={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
              autoComplete="current-password"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PasswordField
                id="newPassword"
                label="New password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                show={showPasswords.next}
                onToggle={() => setShowPasswords((p) => ({ ...p, next: !p.next }))}
                autoComplete="new-password"
              />
              <PasswordField
                id="confirmNewPassword"
                label="Confirm new password"
                value={passwordForm.confirmNewPassword}
                onChange={handlePasswordChange}
                show={showPasswords.confirm}
                onToggle={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-purple-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[var(--text-secondary)]">
                Minimum 8 characters. Mix letters, numbers, and symbols.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl border border-purple-100 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-purple-50 disabled:opacity-50 sm:w-auto"
              >
                {isLoading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </Section>
      </div>

      {showJoinCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-purple-100/50 bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Join a community</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Select a Commun community. A secretary will review your request.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinCommunity(false)}
                className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-purple-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleJoinCommunity} className="space-y-4">
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className={inputClass}
                required
                disabled={communitiesLoading}
              >
                <option value="">
                  {communitiesLoading ? 'Loading communities…' : 'Select community'}
                </option>
                {communities.map((c) => (
                  <option key={c.communName} value={c.communName}>
                    {formatCommunDisplayName(c.communName)}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinCommunity(false)}
                  className="flex-1 rounded-xl border border-purple-100 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-purple-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joiningCommunity || !selectedCommunity}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {joiningCommunity ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UpdateProfile;
