import { useState, useEffect } from 'react'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api, apiErrorMessage, setAuthToken } from '../lib/api.js'
import { UserIcon, MailIcon, LockIcon } from '../components/Icons.jsx'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      })
    }
  }, [user])

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value })
    setError('')
    setSuccess('')
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value })
    setError('')
    setSuccess('')
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setError('Name and email are required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Server accepts only name / bio / headline / avatarUrl (email is fixed)
      const res = await api.patch('/auth/me', {
        name: profileData.name,
        bio: profileData.bio,
        avatarUrl: profileData.avatarUrl,
      })
      updateUser(res.data.user)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('Current password and new password are required')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Server signs a fresh JWT after a password change — keep the session alive
      const res = await api.patch('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      localStorage.setItem('lh_token', res.data.token)
      setAuthToken(res.data.token)
      setSuccess('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile settings</h1>
          <p className="mt-2 text-slate-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Profile picture</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    {profileData.avatarUrl ? (
                      <img
                        src={profileData.avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-brand-100 text-2xl font-bold text-brand-700">
                        {profileData.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="url"
                      value={profileData.avatarUrl}
                      onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
                      className="block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="mt-1 text-xs text-slate-500">Enter a URL for your profile picture</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <div className="relative mt-1">
                  <UserIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative mt-1">
                  <MailIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    readOnly
                    className="block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-500 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Email can't be changed in this demo.</p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm text-slate-600">Role: <span className="font-medium text-slate-900 capitalize">{user?.role}</span></p>
                  <p className="mt-1 text-xs text-slate-500">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
                  Current password
                </label>
                <div className="relative mt-1">
                  <LockIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative mt-1">
                  <LockIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <div className="relative mt-1">
                  <LockIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Account information</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Account ID</span>
                <span className="font-mono text-slate-900">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email verified</span>
                <span className="text-emerald-600 font-medium">Yes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Account type</span>
                <span className="font-medium text-slate-900 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
