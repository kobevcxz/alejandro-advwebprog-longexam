import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUser, changePassword } from '../../services/UserService';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[#003A8F]';

const AccountPage = () => {
  const { user, login } = useAuth();
  
  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?._id) return user._id;

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) return parsed.id;
        if (parsed._id) return parsed._id;
      }

      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken.id || decodedToken._id || decodedToken.userId || '';
      }
    } catch (e) {
      console.error('Error resolving user ID:', e);
    }
    return '';
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID is missing from session.');
      }

      const response = await updateUser(userId, formData);
      
      const updatedUser = response?.data?.user || response?.data || { ...user, ...formData };
      login(updatedUser, localStorage.getItem('token'));

      setMessage('Profile successfully updated!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID is missing from session.');
      }
      await changePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage('Password successfully changed in the database!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-16 max-w-5xl mx-auto font-lexend pt-6 px-4 sm:px-6 lg:px-0">
      
      <div className="border-y-2 border-[#003A8F] bg-white px-4 py-6 sm:px-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#003A8F]">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Manage your account</h1>
        <p className="mt-2 text-sm text-zinc-600">Update your personal preferences and credentials securely.</p>
      </div>

      <div className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm">
        <div className="border-b border-zinc-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Personal Information</h2>
          <p className="text-xs text-zinc-500 mt-0.5">View and update your personal details and contact information.</p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-zinc-700">
              First name
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleProfileChange}
                className={inputClasses}
                required
              />
            </label>

            <label className="block text-sm font-semibold text-zinc-700">
              Last name
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleProfileChange}
                className={inputClasses}
                required
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-zinc-700">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className={`${inputClasses} bg-zinc-50 text-zinc-500 cursor-not-allowed`}
            />
            <span className="text-[11px] text-zinc-400 mt-1 block">Email address cannot be changed directly.</span>
          </label>

          <label className="block text-sm font-semibold text-zinc-700">
            Contact number
            <input
              type="text"
              name="contactNumber"
              placeholder="e.g. 09123456789"
              value={formData.contactNumber}
              onChange={handleProfileChange}
              className={inputClasses}
            />
          </label>

          <label className="block text-sm font-semibold text-zinc-700">
            Address
            <textarea
              name="address"
              rows="3"
              placeholder="Enter your complete delivery address..."
              value={formData.address}
              onChange={handleProfileChange}
              className={`${inputClasses} resize-none`}
            />
          </label>

          <div className="flex items-center justify-end pt-6 border-t border-zinc-100 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full border-2 border-[#003A8F] bg-[#003A8F] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#002b6b] transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border-2 border-[#003A8F] bg-white p-6 sm:p-8 shadow-sm">
        <div className="border-b border-zinc-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Change Password</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Ensure your account is using a secure password.</p>
        </div>

        {passwordMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <label className="block text-sm font-semibold text-zinc-700">
            Current password
            <input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={handlePasswordChangeInput}
              className={inputClasses}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-zinc-700">
            New password
            <input
              type="password"
              name="newPassword"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={handlePasswordChangeInput}
              className={inputClasses}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-zinc-700">
            Confirm new password
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChangeInput}
              className={inputClasses}
              required
            />
          </label>

          <div className="flex items-center justify-end pt-6 border-t border-zinc-100 mt-6">
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-full border-2 border-[#003A8F] bg-[#003A8F] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#002b6b] transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;