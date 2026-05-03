import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const ResetPasswordManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/users');
      if (res.data && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        setError('No users found');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
    }
    setLoading(false);
  };

  const handleReset = async (user) => {
    setResetting((prev) => ({ ...prev, [user._id]: true }));
    setMessage('');
    try {
      const res = await api.post(`/api/users/${user._id}/reset-password`);
      const pwd = res.data && res.data.password ? res.data.password : '(unknown)';
      setMessage(`Password reset for ${user.email}. Default password: ${pwd}`);
      // Remove user from list after successful reset
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (e) {
      setMessage(`Failed to reset password for ${user.email}`);
    }
    setResetting((prev) => ({ ...prev, [user._id]: false }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Reset Password Management</h2>
        <button onClick={fetchUsers} style={{ padding: '6px 16px', fontSize: 14 }}>Refresh</button>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Email</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{user.email}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{user.fullName}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <button
                    onClick={() => handleReset(user)}
                    disabled={!!resetting[user._id]}
                  >
                    {resetting[user._id] ? 'Resetting...' : 'Reset'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {message && <p style={{ color: 'green', marginTop: 16 }}>{message}</p>}
    </div>
  );
};

export default ResetPasswordManagement;
