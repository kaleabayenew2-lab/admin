import React, { useEffect, useState } from 'react';
import UsersTable from '../components/UsersTable';
import usersService, { AdminUser } from '../services/users';
import { useConfirm } from '../contexts/ConfirmContext';

export default function Users(){
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showOnlyTelegram, setShowOnlyTelegram] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editingErrors, setEditingErrors] = useState<Record<string,string>>({});

  const confirm = useConfirm();
  const load = async () => {
    setLoading(true);
    try {
      const list = await usersService.getUsers();
      setUsers(list);
    } catch (e) {
      console.error(e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to load users' } })); } catch (e) {}
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (u: AdminUser) => {
    setEditing(u);
  };

  const handleSave = async (updated: AdminUser) => {
    // validate
    try {
      const { validateUserInput } = await import('../utils/validators');
      const v = validateUserInput(updated);
      if (Object.keys(v).length > 0) { setEditingErrors(v); return; }
    } catch (e) {}

    try {
      await usersService.updateUser(updated._id, { fullName: updated.fullName, email: updated.email, phone: updated.phone, roles: updated.roles, isActive: updated.isActive });
      setEditing(null);
      setEditingErrors({});
      await load();
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Saved' } })); } catch (e) {}
    } catch (e: any) {
      console.error(e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: (e && e.response && e.response.data && e.response.data.message) || 'Save failed' } })); } catch (e) {}
    }
  };

  const handleReset = async (u: AdminUser) => {
    const ok = await confirm({ title: 'Reset password', message: `Reset password for ${u.fullName || u.email}?`, confirmText: 'Reset', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      const res = await usersService.resetPassword(u._id);
      if (res && res.password) {
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: `Temporary password: ${res.password}` } })); } catch(e){}
      } else try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'Password reset' } })); } catch(e){}
    } catch (e) {
      console.error(e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Reset failed' } })); } catch(e){}
    }
  };

  const handleDelete = async (u: AdminUser) => {
    const ok2 = await confirm({ title: 'Delete user', message: `Delete user ${u.fullName || u.email}? This cannot be undone.`, confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok2) return;
    try {
      await usersService.deleteUser(u._id);
      await load();
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Deleted' } })); } catch(e){}
    } catch (e) {
      console.error(e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Delete failed' } })); } catch(e){}
    }
  };

  return (
    <div id="main" className="p-4">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <div className="mb-4 flex items-center gap-3">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showOnlyTelegram} onChange={(e)=>setShowOnlyTelegram(e.target.checked)} />
          <span>Show only Telegram-connected</span>
        </label>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <UsersTable users={showOnlyTelegram ? users.filter(u=>!!(u.telegramChatId || u.telegramUsername)) : users} onEdit={handleEdit} onReset={handleReset} onDelete={handleDelete} />
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-user-title" className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-lg">
            <h3 id="edit-user-title" className="text-lg font-semibold mb-3">Edit User</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Full name</label>
                <input className="w-full border px-2 py-1" value={editing.fullName || ''} onChange={(e)=>setEditing({...editing, fullName: e.target.value})} />
                {editingErrors.fullName && <div className="text-xs text-red-600 mt-1">{editingErrors.fullName}</div>}
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input className="w-full border px-2 py-1" value={editing.email || ''} onChange={(e)=>setEditing({...editing, email: e.target.value})} />
                {editingErrors.email && <div className="text-xs text-red-600 mt-1">{editingErrors.email}</div>}
              </div>
              <div>
                <label className="block text-sm">Phone</label>
                <input className="w-full border px-2 py-1" value={editing.phone || ''} onChange={(e)=>setEditing({...editing, phone: e.target.value})} />
                {editingErrors.phone && <div className="text-xs text-red-600 mt-1">{editingErrors.phone}</div>}
              </div>
              <div>
                <label className="block text-sm">Roles (comma separated)</label>
                <input className="w-full border px-2 py-1" value={(editing.roles || []).join(', ')} onChange={(e)=>setEditing({...editing, roles: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
              </div>
              <div className="flex items-center">
                <label className="mr-3">Active</label>
                <input type="checkbox" checked={!!editing.isActive} onChange={(e)=>setEditing({...editing, isActive: e.target.checked})} />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-3 py-2 bg-gray-300 rounded" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>handleSave(editing)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
