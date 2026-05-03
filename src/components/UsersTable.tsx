import React from 'react';
import { AdminUser } from '../services/users';
import Button from './Button';

type Props = {
  users: AdminUser[];
  onEdit: (u: AdminUser) => void;
  onReset: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
};

export default function UsersTable({ users, onEdit, onReset, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="table-base w-full">
        <thead>
          <tr>
            <th className="table-header">Name</th>
            <th className="table-header">Email</th>
            <th className="table-header">Phone</th>
            <th className="table-header">Roles</th>
            <th className="table-header">Active</th>
            <th className="table-header">Telegram</th>
            <th className="table-header text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-gray-700">
          {users.map((u) => (
            <tr key={u._id}>
              <td className="table-cell font-medium">{u.fullName}</td>
              <td className="table-cell">{u.email}</td>
              <td className="table-cell">{u.phone}</td>
              <td className="table-cell">{(u.roles || []).join(', ')}</td>
              <td className="table-cell">{u.isActive ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-gray-500">No</span>}</td>
              <td className="table-cell">{u.telegramUsername ? `@${u.telegramUsername}` : (u.telegramChatId ? 'Linked' : '—')}</td>
              <td className="table-cell text-center">
                <div className="inline-flex gap-2">
                  <Button variant="primary" className="px-2 py-1 text-sm" onClick={() => onEdit(u)}>Edit</Button>
                  <Button variant="secondary" className="px-2 py-1 text-sm" onClick={() => onReset(u)}>Reset</Button>
                  <Button variant="danger" className="px-2 py-1 text-sm" onClick={() => onDelete(u)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
