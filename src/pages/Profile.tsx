import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import adminService from '../services/admin';
import Button from '../components/Button';
import ImageUploader from '../components/ImageUploader';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const [profile, setProfile] = useState<any>({ name: '', email: '', phone: '' });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // password change
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // api key
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await adminService.getProfile();
        if (p) {
          setProfile(p);
          setAvatarUrl(p.avatarUrl || localStorage.getItem('profileAvatar'));
        } else {
          // fallback to localStorage
          const a = localStorage.getItem('profileAvatar');
          const e = localStorage.getItem('profileEmail');
          const n = localStorage.getItem('profileName');
          setAvatarUrl(a);
          setProfile({ name: n || '', email: e || '', phone: '' });
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  // Removed unused onFile function

  const saveProfile = async () => {
    // run validators
    try {
      const { validateProfile } = await import('../utils/validators');
      const v = validateProfile(profile);
      if (Object.keys(v).length > 0) {
        setErrors(v);
        return;
      }
    } catch (e) {
      // ignore
    }

    setSaving(true);
    setErrors({});
    try {
      const updated = await adminService.updateProfile(profile);
      setProfile(updated || profile);
      if (updated?.avatarUrl) setAvatarUrl(updated.avatarUrl);
      // persist some values locally for quick loading
      localStorage.setItem('profileEmail', profile.email || '');
      localStorage.setItem('profileName', profile.name || '');
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Profile saved' } })); } catch (e) {}
    } catch (e) {
      console.error('Save failed', e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to save profile' } })); } catch (e) {}
    } finally { setSaving(false); }
  };

  const doChangePassword = async () => {
    if (newPassword !== confirmPassword) { try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'warning', message: 'Passwords do not match' } })); } catch (e) {} ; return; }
    try {
      const { validatePassword } = await import('../utils/validators');
      const err = validatePassword(newPassword);
      if (err) { try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'warning', message: err } })); } catch (e) {} ; return; }
    } catch (e) {}

    if (!currentPassword) { try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'warning', message: 'Current password is required' } })); } catch (e) {} ; return; }

    setSaving(true);
    try {
      await adminService.changePassword(currentPassword, newPassword);
      setShowPassword(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Password changed' } })); } catch (e) {}
    } catch (e) {
      console.error('Password change failed', e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to change password' } })); } catch (e) {}
    } finally { setSaving(false); }
  };

  const loadApiKey = async () => {
    try {
      const k = await adminService.getApiKey();
      setApiKey(k || null);
    } catch (e) { console.error('Failed to load api key', e); }
  };

  const confirm = useConfirm();
  const auth = useAuth();

  const regenApiKey = async () => {
    const ok = await confirm({ title: 'Regenerate API key', message: 'Regenerate API key? This will invalidate the current key.', confirmText: 'Regenerate', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      const k = await adminService.regenerateApiKey();
      setApiKey(k || null);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'API key regenerated' } })); } catch (e) {}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to regenerate API key' } })); } catch (e) {} }
  };

  const logout = async () => {
    const ok = await confirm({ title: 'Sign out', message: 'Are you sure you want to sign out?', confirmText: 'Sign out', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      localStorage.removeItem('authToken');
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'Signed out' } })); } catch (e) {}
      auth.logout();
    } catch (e) {
      console.error('Logout failed', e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to sign out' } })); } catch (e) {}
    }
  };

  return (
    <Layout>
      <div className="admin-container p-6">
        <h1 className="page-title">Profile</h1>

        {loading ? <div className="mt-6"><Loading text="Loading profile..." /></div> : (
          <div className="mt-4 card">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32">
                <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden">
                  {avatarUrl ? <img loading="lazy" decoding="async" src={avatarUrl} alt="profile avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">No avatar</div>}
                </div>
                <div className="mt-2">
                  {/* ImageUploader provides preview, compression and upload choices */}
                  <ImageUploader
                    accept="image/*"
                    maxWidth={800}
                    initialQuality={0.85}
                    uploadLabel="Upload avatar"
                    onUpload={async (f)=>{
                      setSaving(true);
                      try {
                        const url = await adminService.uploadAvatar(f as File);
                        setAvatarUrl(url);
                        localStorage.setItem('profileAvatar', url);
                      } finally { setSaving(false); }
                    }}
                  />
                  {saving && <div className="text-sm text-gray-500">Uploading...</div>}
                </div>
              </div>

              <div className="flex-1">
                <div className="form-row">
                  <div className="field">
                    <label className="form-label">Name</label>
                    <input className="input" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="form-label">Email</label>
                    <input className="input" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                    {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label className="form-label">Phone</label>
                    <input className="input" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                    {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
                  <Button variant="secondary" onClick={() => setShowPassword(true)}>Change Password</Button>
                  <Button variant="ghost" onClick={logout}>Logout</Button>
                </div>
              </div>
            </div>

            {/* API Key section */}
            <div className="mt-6">
              <h3 className="font-medium">API Key</h3>
              <p className="text-sm text-gray-600">Use the API key to access admin endpoints programmatically.</p>
              <div className="mt-2 flex items-center gap-2">
                <input className="input flex-1" value={apiKey ?? ''} readOnly placeholder="No API key loaded" />
                <Button variant="secondary" onClick={loadApiKey}>Load</Button>
                <Button variant="danger" onClick={regenApiKey}>Regenerate</Button>
              </div>
            </div>

            {/* Password modal */}
            {showPassword && (
              <div className="mt-6 p-4 border rounded bg-gray-50">
                <h4 className="font-semibold">Change password</h4>
                <label className="block mt-2">Current password</label>
                <input type="password" className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <label className="block mt-2">New password</label>
                <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <label className="block mt-2">Confirm new password</label>
                <input type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <div className="mt-3 flex gap-2">
                  <Button onClick={doChangePassword}>Submit</Button>
                  <Button variant="secondary" onClick={() => setShowPassword(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
