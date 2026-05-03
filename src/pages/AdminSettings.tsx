import React, { useEffect, useState } from 'react';
import adminService from '../services/admin';
import Button from '../components/Button';
import ImageUploader from '../components/ImageUploader';
import Toggle from '../components/Toggle';

export default function AdminSettings(){
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await adminService.getSettings();
      setSettings(s);
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to load settings' } })); } catch(e){} }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await adminService.updateSettings(settings);
      setSettings(updated);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Saved' } })); } catch(e){}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Save failed' } })); } catch(e){} }
    finally { setSaving(false); }
  };

  const testSmtp = async () => {
    try {
      await adminService.testSmtp({ host: settings.smtpHost, port: settings.smtpPort, user: settings.smtpUser, pass: settings.smtpPass });
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'SMTP test success' } })); } catch(e){}
    } catch (err) { console.error(err); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'SMTP test failed' } })); } catch(e){} }
  };

  if (loading || !settings) return <div id="main" className="p-4">Loading settings...</div>;

  return (
    <div className="admin-container p-4">
      <h2 className="page-title">System Settings</h2>
      <p className="page-subtitle">Configure app name/logo, language, map provider, backups, and security.</p>
      <div className="mb-4">
        <strong>Customize system behavior and integrations</strong>
      </div>
      <div className="card max-w-admin">
        <h3 className="font-semibold mb-2">Features</h3>
        <div className="grid-2">
          <div>
            <label className="form-label">Enable dark mode</label>
            <div><Toggle checked={!!settings.darkMode} onChange={(v)=>setSettings({...settings, darkMode: v})} /></div>
          </div>
          <div>
            <label className="form-label">Multi-language support</label>
            <div><Toggle checked={!!settings.multiLanguage} onChange={(v)=>setSettings({...settings, multiLanguage: v})} /></div>
          </div>
        </div>
        <div className="mt-4">
          <label className="form-label">Enable real-time updates (WebSocket)</label>
          <div><Toggle checked={!!settings.realtimeUpdates} onChange={(v)=>setSettings({...settings, realtimeUpdates: v})} /></div>
        </div>
        <h3 className="font-semibold mb-2">General</h3>
        <div className="grid-2">
          <div>
            <label className="form-label">App name</label>
            <input className="input" value={settings.appName || ''} onChange={(e)=>setSettings({...settings, appName: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Default language</label>
            <input className="input" value={settings.defaultLanguage || ''} onChange={(e)=>setSettings({...settings, defaultLanguage: e.target.value})} />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
              {settings.logoUrl ? <img loading="lazy" decoding="async" src={settings.logoUrl} alt={settings.name ? `${settings.name} logo` : 'logo'} className="w-full h-full object-contain" /> : <span className="text-sm text-gray-500">No logo</span>}
            </div>
            <div className="flex-1">
              <ImageUploader uploadLabel="Upload logo" onUpload={async (f: File)=>{
                const url = await adminService.uploadSettingAsset(f);
                setSettings({...settings, logoUrl: url});
              }} />
              <div className="form-help">Recommended: PNG or SVG, less than 1 MB</div>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">Map & Location</h3>
        <div className="grid-2">
          <div>
            <label className="form-label">Map provider</label>
            <select className="input" value={settings.mapProvider || 'google'} onChange={(e)=>setSettings({...settings, mapProvider: e.target.value})}>
              <option value="google">Google Maps</option>
              <option value="osm">OpenStreetMap</option>
            </select>
          </div>
          <div>
            <label className="form-label">Map API key (optional)</label>
            <input className="input" value={settings.mapApiKey || ''} onChange={(e)=>setSettings({...settings, mapApiKey: e.target.value})} />
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">Notifications & Integrations</h3>
        <div className="grid-2">
          <div>
            <label className="form-label">Enable email notifications</label>
            <div><Toggle checked={!!settings.emailNotifications} onChange={(v)=>setSettings({...settings, emailNotifications: v})} /></div>
          </div>
          <div>
            <label className="form-label">Telegram bot username</label>
            <input className="input" value={settings.telegramBot || ''} onChange={(e)=>setSettings({...settings, telegramBot: e.target.value})} />
          </div>
        </div>

        <div className="mt-4 grid-2">
          <div>
            <label className="form-label">SMTP host</label>
            <input className="input" value={settings.smtpHost || ''} onChange={(e)=>setSettings({...settings, smtpHost: e.target.value})} />
          </div>
          <div>
            <label className="form-label">SMTP port</label>
            <input type="number" className="input" value={settings.smtpPort || 587} onChange={(e)=>setSettings({...settings, smtpPort: parseInt(e.target.value || '0')})} />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">SMTP username</label>
          <input className="input" value={settings.smtpUser || ''} onChange={(e)=>setSettings({...settings, smtpUser: e.target.value})} />
          <label className="form-label mt-2">SMTP password</label>
          <div className="flex gap-2 items-center">
            <input className="input" type="password" value={settings.smtpPass || ''} onChange={(e)=>setSettings({...settings, smtpPass: e.target.value})} />
            <Button variant="ghost" onClick={testSmtp}>Test SMTP</Button>
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">Content & Admin</h3>
        <div className="grid-2">
          <div>
            <label className="form-label">Enable user registration</label>
            <div><Toggle checked={!!settings.allowRegistration} onChange={(v)=>setSettings({...settings, allowRegistration: v})} /></div>
          </div>
          <div>
            <label className="form-label">Default page size</label>
            <input type="number" className="input" value={settings.defaultPageSize || 20} onChange={(e)=>setSettings({...settings, defaultPageSize: parseInt(e.target.value || '0')})} />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Announcement reminder offset (minutes before end)</label>
          <input type="number" className="input" value={settings.reminderOffsetMinutes || 30} onChange={(e)=>setSettings({...settings, reminderOffsetMinutes: parseInt(e.target.value || '0')})} />
        </div>

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">Analytics & Ads</h3>
        <div className="grid-2">
          <div>
            <label className="form-label">Enable analytics</label>
            <div><Toggle checked={!!settings.enableAnalytics} onChange={(v)=>setSettings({...settings, enableAnalytics: v})} /></div>
          </div>
          <div>
            <label className="form-label">Enable advertisements</label>
            <div><Toggle checked={!!settings.enableAds} onChange={(v)=>setSettings({...settings, enableAds: v})} /></div>
          </div>
        </div>

        <div className="mt-3">
          <strong>Analytics — User tracking · Page views · Behavior tracking</strong>
          <div className="grid-2 mt-2">
            <div>
              <label className="form-label">User tracking</label>
              <div><Toggle checked={!!settings.userTracking} onChange={(v)=>setSettings({...settings, userTracking: v})} /></div>
            </div>
            <div>
              <label className="form-label">Page views</label>
              <div><Toggle checked={!!settings.pageViews} onChange={(v)=>setSettings({...settings, pageViews: v})} /></div>
            </div>
          </div>
          <div className="mt-2">
            <label className="form-label">Behavior tracking</label>
            <div><Toggle checked={!!settings.behaviorTracking} onChange={(v)=>setSettings({...settings, behaviorTracking: v})} /></div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={load} disabled={saving}>Reload</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}
