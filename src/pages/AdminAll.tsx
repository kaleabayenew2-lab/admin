import React, { useEffect, useState } from 'react';
import adminService from '../services/admin';
import usersService, { AdminUser } from '../services/users';
import { useConfirm } from '../contexts/ConfirmContext';
import UsersTable from '../components/UsersTable';
import Card from '../components/Card';

export default function AdminAll() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAll();
      setData(res);
    } catch (e) {
      console.error(e);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirm = useConfirm();
  const handleEdit = (u: AdminUser) => { /* reuse Users page edit modal? navigate to /users or open modal */ try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'Use Users page to edit' } })); } catch(e){} };
  const handleReset = async (u: AdminUser) => {
    const ok = await confirm({ title: 'Reset password', message: `Reset password for ${u.fullName || u.email}?`, confirmText: 'Reset', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      const res = await usersService.resetPassword(u._id);
      if (res && res.password) try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: `Temporary password: ${res.password}` } })); } catch(e){}
      else try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'Password reset' } })); } catch(e){}
      await load();
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Reset failed' } })); } catch(e){} }
  };
  const handleDelete = async (u: AdminUser) => {
    const ok = await confirm({ title: 'Delete user', message: `Delete user ${u.fullName || u.email}? This cannot be undone.`, confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      await usersService.deleteUser(u._id);
      await load();
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Deleted' } })); } catch(e){}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Delete failed' } })); } catch(e){} }
  };

  const handleRemoveAllFacilities = async () => {
    const ok = await confirm({ 
      title: 'Remove All Facilities', 
      message: 'Are you sure you want to remove ALL facilities? This action cannot be undone and will permanently delete all facility data.', 
      confirmText: 'Remove All', 
      cancelText: 'Cancel', 
      danger: true 
    });
    if (!ok) return;
    try {
      const response = await fetch('/api/admin/facilities', { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        await load(); // Reload data to update counts
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: result.message } })); } catch(e){}
      } else {
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: result.message || 'Failed to remove facilities' } })); } catch(e){}
      }
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to remove facilities' } })); } catch(e){} }
  };

  const handleRemoveAllPages = async () => {
    const ok = await confirm({ 
      title: 'Remove All Pages', 
      message: 'Are you sure you want to remove ALL pages/content? This action cannot be undone and will permanently delete all content data.', 
      confirmText: 'Remove All', 
      cancelText: 'Cancel', 
      danger: true 
    });
    if (!ok) return;
    try {
      // Get all content items first
      const contentItems = await adminService.getContent();
      if (contentItems && contentItems.length > 0) {
        // Delete each content item
        for (const item of contentItems) {
          await adminService.deleteContent(item._id);
        }
        await load();
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: `Removed ${contentItems.length} pages` } })); } catch(e){}
      } else {
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'No pages to remove' } })); } catch(e){}
      }
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to remove pages' } })); } catch(e){} }
  };

  return (
    <div id="main" className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Admin — All</h2>

      {loading && <div>Fast Loading Time<br/><br/>Under 3 seconds ideally</div>}
      {error && <div className="text-red-600">{error}</div>}

      {data && (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2">Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(data.stats || {}).map(k => (
                <Card key={k} className="p-4">
                  <div className="text-sm text-gray-600">{k}</div>
                  <div className="text-2xl font-bold mt-1">{String((data.stats || {})[k])}</div>
                </Card>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-700">Totals — users: {data.totals.users}, facilities: {data.totals.facilities}, feedbacks: {data.totals.feedbacks}, notifications: {data.totals.notifications}</div>
            
            {/* Remove All Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleRemoveAllFacilities}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Remove All Facilities ({data.totals.facilities})
              </button>
              <button
                onClick={handleRemoveAllPages}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Remove All Pages/Content
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Recent Users</h3>
            <Card>
              <UsersTable users={data.users} onEdit={handleEdit} onReset={handleReset} onDelete={handleDelete} />
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Recent Facilities</h3>
            <Card>
              <div className="space-y-2">
                {data.facilities && data.facilities.length === 0 && <div className="text-sm text-gray-600">No facilities</div>}
                {data.facilities && data.facilities.map((f: any) => (
                  <div key={f._id} className="p-2 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-sm text-gray-600">{f.type} — {f.address || '—'}</div>
                    </div>
                    <div className="text-sm text-gray-500">{f.isEmergency ? <span className="text-red-600 font-semibold">Emergency</span> : <span className="text-gray-500">—</span>}</div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Recent Feedbacks</h3>
            <Card>
              {data.feedbacks && data.feedbacks.length === 0 && <div className="text-sm text-gray-600">No feedbacks</div>}
              {data.feedbacks && data.feedbacks.map((fb: any, idx: number) => (
                <div key={idx} className="p-2 border rounded mb-2">
                  <div className="text-sm text-gray-700">{fb.text || fb.feedback || JSON.stringify(fb)}</div>
                  <div className="text-xs text-gray-500">{fb.user || fb.createdAt || ''}</div>
                </div>
              ))}
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Recent Notifications</h3>
            <Card>
              {data.notifications && data.notifications.length === 0 && <div className="text-sm text-gray-600">No notifications</div>}
              {data.notifications && data.notifications.map((n: any, idx: number) => (
                <div key={idx} className="p-2 border rounded mb-2">
                  <div className="text-sm text-gray-700">{n.text || n.message || JSON.stringify(n)}</div>
                  <div className="text-xs text-gray-500">{n.createdAt || ''}</div>
                </div>
              ))}
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
