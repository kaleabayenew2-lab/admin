import api from '../services/api';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { API_BASE } from '../services/api';
import usersService from '../services/users';
import { listMessages } from '../services/chat';
import LoadingScreen from './LoadingScreen';

export default function NavBar({ onToggle, isOpen }: { onToggle?: () => void; isOpen?: boolean }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const toggle = onToggle ?? (() => {});
  const open = !!isOpen;
  const items = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/map', label: 'Map', icon: '🗺️' },
    { to: '/reports', label: 'Reports', icon: '📈' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
    { to: '/terms', label: 'Terms', icon: '📄' },
    { to: '/legal', label: 'Legal & Trust', icon: '⚖️' }
  ];

  const [showNotif, setShowNotif] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [sendersMap, setSendersMap] = useState<Record<string,string>>({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);
  

  // Example notifications — replace with real fetch later
  const notifications = [
    { id: '1', title: 'New facility added', body: 'Clinic Alpha has been added nearby.' },
    { id: '2', title: 'High rating', body: 'Pharmacy Beta reached 4.9 stars.' },
    { id: '3', title: 'Report received', body: 'User reported incorrect address for Clinic Z.' }
  ];

  useEffect(() => {
    // load known users for display names and existing unread counts
    (async () => {
      try {
        const ulist = await usersService.getUsers();
        const map: Record<string,string> = {};
        (ulist || []).forEach((u: any) => { map[u._id] = u.fullName || (u.email || u.phone || ''); });
        setSendersMap(map);
      } catch (e) { /* ignore */ }

      try {
        const msgs: any[] = await listMessages();
        const convs: Record<string, number> = {};
        (msgs || []).forEach(m => {
          const conv = m.conversationId || (m.from === 'admin' ? m.to : m.from) || m.to || 'unknown';
          // treat messages not from admin as unread by default (best-effort)
          if (m.from !== 'admin') convs[conv] = (convs[conv] || 0) + 1;
        });
        setUnreadCounts(convs);
        setTotalUnread(Object.values(convs).reduce((s,n) => s + n, 0));
      } catch (e) {}
    })();

    // connect to SSE for realtime chat notifications
    try {
      const esUrl = `${API_BASE.replace(/\/$/, '')}/api/notifications/stream`;
      const es = new EventSource(esUrl);
      es.addEventListener('notification', (ev: any) => {
        try {
          const data = JSON.parse(ev.data);
          if (data && data.type === 'chat_message') {
            const conv = data.conversationId || (data.from === 'admin' ? data.to : data.from) || 'unknown';
            setUnreadCounts(prev => {
              const next = { ...prev };
              // if admin is viewing the conversation elsewhere, we can't know here — increment
              next[conv] = (next[conv] || 0) + 1;
              return next;
            });
            setTotalUnread(prev => prev + 1);
            // update sender name map
            setSendersMap(prev => ({ ...prev, [conv]: data.fromName || data.from || prev[conv] || conv }));
          }
        } catch (e) { console.error('sse parse', e); }
      });
      esRef.current = es;
    } catch (e) {
      console.warn('SSE not available', e);
    }
    return () => { if (esRef.current) esRef.current.close(); };
  }, []);
  
  useEffect(() => {
    if (showNotif) {
      // auto-advance slideshow every 3s
      timerRef.current = window.setInterval(() => {
        setCurrent((c) => (c + 1) % notifications.length);
      }, 3000) as unknown as number;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current as number);
        timerRef.current = null;
      }
      setCurrent(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as number);
    };
  }, [showNotif]);

  const auth = useAuth();
  const [isDark, setIsDark] = useState<boolean>(false);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin:darkMode');
      if (saved !== null) {
        const val = saved === '1';
        setIsDark(val);
        if (val) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem('admin:darkMode', next ? '1' : '0');
    } catch (e) {}
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };
  const confirm = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({ title: 'Sign out', message: 'Are you sure you want to sign out?', confirmText: 'Sign out', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    
    // Add smooth transition effect before logout
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.98)';
    
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // ignore network errors
    }
    
    auth.logout();
    
    // Smooth transition to login page
    setTimeout(() => {
      document.body.style.opacity = '0';
      document.body.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    }, 200);
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} message="Loading..." />
      <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
      <a href="#main" className="skip-link sr-only focus:not-sr-only inline-block p-2">Skip to main content</a>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <button
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${open ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              onClick={() => toggle()}
              aria-label="Toggle sidebar"
              aria-expanded={open}
            >
              {open ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/src/images/logo.png" 
                  alt="FindMed" 
                  className="h-10 w-auto animate-zoom-in drop-shadow-md" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FindMed
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            {items.map((it) => {
              const isActive = it.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative px-4 py-2 rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105 ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 animate-slideIn' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => {
                    // Show loading screen
                    setIsLoading(true);
                    
                    // Add smooth page transition effect
                    document.body.style.opacity = '0.8';
                    document.body.style.transform = 'scale(0.98)';
                    
                    setTimeout(() => {
                      document.body.style.opacity = '1';
                      document.body.style.transform = 'scale(1)';
                      setIsLoading(false);
                    }, 300);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className={`text-lg transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`}>{it.icon}</span>
                    <span className={`font-medium transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>{it.label}</span>
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 relative">
              {/* Dark mode toggle */}
              <div className="hidden md:block">
                <button 
                  onClick={toggleDark} 
                  aria-pressed={isDark} 
                  aria-label="Toggle dark mode" 
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                >
                  {isDark ? (
                    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M7.05 6.05L5.64 4.64m12.02 0l-1.41 1.41M7.05 17.95l-1.41 1.41" />
                    </svg>
                  )}
                </button>
              </div>

            {/* Notification icon + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotif((s) => !s)}
                aria-expanded={showNotif}
                aria-label="Notifications"
                className="relative p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                </svg>
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
                    {totalUnread}
                  </span>
                )}
              </button>

              <div
                className={`origin-top-right right-0 mt-3 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform ${showNotif ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ position: 'absolute' }}
              >
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {totalUnread > 0 ? `${totalUnread} unread` : 'All read'}
                    </div>
                  </div>
                  {/* Chat senders with unread counts */}
                  {Object.keys(unreadCounts).length > 0 ? (
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      {Object.keys(unreadCounts).map((conv) => (
                        <div key={conv} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {sendersMap[conv] || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">New message</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                              {unreadCounts[conv]}
                            </div>
                            <button
                              className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                              onClick={() => {
                                setShowNotif(false);
                                setUnreadCounts(prev => { const n = { ...prev }; const dec = n[conv] || 0; delete n[conv]; setTotalUnread(t => Math.max(0, t - dec)); return n; });
                                navigate('/chat', { state: { conversationId: conv } });
                              }}
                            >View</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 h-20 relative">
                      {notifications.map((n, i) => (
                        <div
                          key={n.id}
                          className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                          aria-hidden={i !== current}
                        >
                          <div className="text-sm font-semibold">{n.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{n.body}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* System notifications slideshow */}
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="h-16 relative">
                      {notifications.map((n, i) => (
                        <div
                          key={n.id}
                          className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                          aria-hidden={i !== current}
                        >
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{n.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.body}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{current + 1}/{notifications.length}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrent((c) => (c - 1 + notifications.length) % notifications.length)}
                          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrent((c) => (c + 1) % notifications.length)}
                          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile */}
            <Link to="/profile" className="ml-2 flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-lg transition-all duration-300 group-hover:scale-110">
                  {typeof window !== 'undefined' && localStorage.getItem('profileAvatar') ? (
                    <img loading="lazy" decoding="async" src={localStorage.getItem('profileAvatar') as string} alt="profile avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.66 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            </Link>

            {/* Logout */}
            <button 
              onClick={handleLogout} 
              className="ml-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
