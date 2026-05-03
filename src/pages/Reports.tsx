import React, { useEffect, useState } from 'react';
// NavBar removed on this page to hide the header
import adminService from '../services/admin';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ErrorBoundary';
import BackendError from '../components/BackendError';
import NoDataFound from '../components/NoDataFound';

type Stats = {
  total_users: number;
  app_users: number;
  profile_creators: number;
  agent_logins: number;
  feedbacks_sent: number;
  total_served: number;
};

export default function Reports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminService.getStats();
      setStats(s as Stats);
    } catch (e:any) {
      console.error(e);
      setError(e?.response?.data?.error || 'Failed to load reports');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);
  const [mostViewed, setMostViewed] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);

  const loadLists = async () => {
    try {
      const mv = await adminService.getMostViewed(20);
      const tr = await adminService.getTopRated(20);
      setMostViewed(mv || []);
      setTopRated(tr || []);
    } catch (e) {
      console.error('Failed to load lists', e);
    }
  };

  useEffect(()=>{ loadLists(); }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <main className="admin-container py-8">

          {loading && <div className="mb-4"><Loading text="Loading stats..." /></div>}
          {error && (() => {
            const isNetworkError = error.includes('Network Error') || error.includes('ERR_NETWORK') || error.includes('timeout');
            if (isNetworkError) {
              return (
                <BackendError 
                  onRetry={() => {
                    setLoading(true);
                    setError(null);
                    load();
                  }}
                  isRetrying={false}
                  error={error}
                />
              );
            }
            return <div className="mb-4 text-red-600">{error}</div>;
          })()}

          {!loading && !error && (
            <div className="grid-3">
              <div className="card">
                <h2 className="text-lg font-semibold">Total Users</h2>
                <p className="text-2xl mt-2">{stats?.total_users ?? '—'}</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">App Users</h2>
                <p className="text-2xl mt-2">{stats?.app_users ?? '—'}</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Users with Profile</h2>
                <p className="text-2xl mt-2">{stats?.profile_creators ?? '—'}</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Agent Logins</h2>
                <p className="text-2xl mt-2">{stats?.agent_logins ?? '—'}</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Feedbacks Sent</h2>
                <p className="text-2xl mt-2">{stats?.feedbacks_sent ?? '—'}</p>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold">Total Served</h2>
                <p className="text-2xl mt-2">{stats?.total_served ?? '—'}</p>
              </div>
            </div>
          )}

          <div className="mt-6 card">
            <h2 className="text-lg font-semibold mb-2">Most Viewed Facilities</h2>
            <div className="overflow-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Views</th>
                    <th className="table-header">Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {mostViewed.map((f:any) => (
                    <tr key={f._id || f.id} className="border-t">
                      <td className="table-cell">{f.name}</td>
                      <td className="table-cell">{f.viewsTotal ?? 0}</td>
                      <td className="table-cell">{f.averageRating ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 card">
            <h2 className="text-lg font-semibold mb-2">Top Rated Facilities</h2>
            <div className="overflow-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Avg Rating</th>
                    <th className="table-header">Ratings</th>
                  </tr>
                </thead>
                <tbody>
                  {topRated.map((f:any) => (
                    <tr key={f._id || f.id} className="border-t">
                      <td className="table-cell">{f.name}</td>
                      <td className="table-cell">{f.averageRating ?? '—'}</td>
                      <td className="table-cell">{f.ratingCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 card">
            <p className="form-help">These numbers are sourced from the backend stats endpoint. If counts are missing, ensure backend is running and the <code>/api/admin/stats</code> endpoint is available.</p>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
