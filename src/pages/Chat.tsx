import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listMessages, sendMessage, getConversation, markConversationRead, listConversationStatuses, setConversationStatus, blockUser, deleteMessage, flagConversation, getChatStats } from '../services/chat';
import usersService from '../services/users';
import { API_BASE } from '../services/api';

export default function ChatPage() {
  const [allMsgs, setAllMsgs] = useState<any[]>([]);
  const [convMsgs, setConvMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [statuses, setStatuses] = useState<Record<string, {status:string, updatedAt?:string}>>({});
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [usersMap, setUsersMap] = useState<Record<string,string>>({});
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyMsgs, setHistoryMsgs] = useState<any[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [newMessageAlert, setNewMessageAlert] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listMessages();
      const arr = Array.isArray(data) ? data : [];
      setAllMsgs(arr);
      // if no conversation selected, show all messages in main pane
      if (!selectedUser) setConvMsgs(arr);
      // load statuses
      try {
        const st = await listConversationStatuses();
        setStatuses(st || {});
      } catch (e) { console.warn('failed loading statuses', e); }
      // load users map for search/labels
      try {
        const ulist = await usersService.getUsers();
        const map: Record<string,string> = {};
        (ulist || []).forEach(u => { map[u._id] = u.fullName || (u.email || u.phone || ''); });
        setUsersMap(map);
      } catch (e) { console.warn('failed loading users', e); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      o.stop(ctx.currentTime + 0.16);
    } catch (e) { console.warn('beep failed', e); }
  }

  useEffect(() => { load(); }, []);

  const location = useLocation();

  useEffect(() => {
    try {
      const conv = (location && (location as any).state && (location as any).state.conversationId) || null;
      if (conv && !loading) selectConversation(conv);
    } catch (e) {}
  }, [loading, location]);

  useEffect(() => {
      // connect to SSE notifications (use absolute backend URL to avoid dev-server proxy issues)
    try {
      const esUrl = `${API_BASE.replace(/\/$/, '')}/api/notifications/stream`;
      const es = new EventSource(esUrl);
      es.addEventListener('notification', (ev: any) => {
        try {
          const data = JSON.parse(ev.data);
          if (data && data.type === 'chat_message') {
            setAllMsgs(prev => [...prev, data]);
            const conv = data.conversationId || (data.from === 'admin' ? data.to : data.from) || 'unknown';
            if (!selectedUser) setConvMsgs(prev => [...prev, data]);
            else if (selectedUser === conv) setConvMsgs(prev => [...prev, data]);
            setUnread(prev => {
              if (selectedUser === conv) return prev; // already viewing
              const next = { ...prev };
              next[conv] = (next[conv] || 0) + 1;
              return next;
            });
            // notification UI + sound
            try {
              setNewMessageAlert(`${data.from}: ${String(data.text || '').slice(0,80)}`);
              if (soundOn) playBeep();
              setTimeout(() => setNewMessageAlert(null), 5000);
            } catch (e) { /* ignore */ }
          }
        } catch (e) { console.error('sse parse', e); }
      });
      esRef.current = es;
    } catch (e) {
      console.warn('SSE not available', e);
    }
    return () => { if (esRef.current) esRef.current.close(); };
  }, [selectedUser]);

  async function handleSend() {
    if (!text.trim()) return;
    const payload: any = { from: 'admin', text: text.trim() };
    if (selectedUser) payload.to = selectedUser;
    if (selectedUser) payload.conversationId = selectedUser;
    try {
      const sent = await sendMessage(payload);
      // append locally
      setAllMsgs(prev => [...prev, sent]);
      setConvMsgs(prev => [...prev, sent]);
      setText('');
    } catch (e) { console.error(e); }
  }

  async function selectConversation(who: string) {
    setSelectedUser(who);
    // try load conversation by id/window
    try {
      const conv = who; // we use conversationId if present; for now use who
      const data = await getConversation(conv);
      setConvMsgs(data || []);
      // mark read on server
      try { await markConversationRead(conv); } catch (e) {}
      setUnread(prev => { const n = {...prev}; delete n[conv]; return n; });
    } catch (e) {
      console.error(e);
    }
  }

  async function openProfile(who: string) {
    // try to fetch full user details; fall back to usersMap
    try {
      const u = await usersService.getUser(who);
      if (u) setProfileUser(u);
      else setProfileUser({ _id: who, fullName: usersMap[who] || who });
    } catch (e) {
      setProfileUser({ _id: who, fullName: usersMap[who] || who });
    }
    setShowProfile(true);
  }

  async function openHistory(who: string) {
    try {
      const conv = await getConversation(who);
      setHistoryMsgs(Array.isArray(conv) ? conv : (conv.messages || []));
    } catch (e) {
      console.error('failed loading history', e);
      setHistoryMsgs([]);
    }
    setShowHistory(true);
  }

  return (
    <div id="main" className="p-4">
      <h2 className="text-xl font-semibold mb-4">Chat Messages</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Conversations</div>
              <div className="flex items-center gap-2">
                <input placeholder="Search user" className="border px-2 py-1 text-sm" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <select className="border px-2 py-1 text-sm" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="all">All status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
              <input type="date" className="border px-2 py-1 text-sm" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
              <input type="date" className="border px-2 py-1 text-sm" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
            </div>
          <div className="space-y-2 max-h-96 overflow-auto">
            {(() => {
              const groups = Array.from(new Set(allMsgs.map(m => m.conversationId || (m.from === 'admin' ? m.to : m.from) || m.to || 'unknown')));
              // sort groups by latest message timestamp desc
              groups.sort((a,b) => {
                const la = allMsgs.filter(m => (m.conversationId|| (m.from === 'admin' ? m.to : m.from) || m.to) === a).slice(-1)[0];
                const lb = allMsgs.filter(m => (m.conversationId|| (m.from === 'admin' ? m.to : m.from) || m.to) === b).slice(-1)[0];
                const ta = la ? (new Date(la.createdAt || la._id?._timestamp || Date.now()).getTime()) : 0;
                const tb = lb ? (new Date(lb.createdAt || lb._id?._timestamp || Date.now()).getTime()) : 0;
                return tb - ta;
              });
              const processed = groups
                .map((who) => {
                  const lastMsg = allMsgs.filter(m => (m.conversationId|| (m.from === 'admin' ? m.to : m.from) || m.to) === who).slice(-1)[0];
                  const lastDate = lastMsg ? new Date(lastMsg.createdAt || Date.now()) : null;
                  const st = statuses[who] && statuses[who].status ? statuses[who].status : 'open';
                  const displayName = usersMap[who] || who;
                  return { who, lastMsg, lastDate, st, displayName };
                })
                .filter(g => {
                  if (search && !String(g.displayName).toLowerCase().includes(search.toLowerCase())) return false;
                  if (statusFilter !== 'all' && g.st !== statusFilter) return false;
                  if (dateFrom) {
                    const d = new Date(dateFrom);
                    if (!g.lastDate || g.lastDate < d) return false;
                  }
                  if (dateTo) {
                    const d = new Date(dateTo);
                    // include whole day
                    d.setHours(23,59,59,999);
                    if (!g.lastDate || g.lastDate > d) return false;
                  }
                  return true;
                })
                .map(g => (
                  <div key={g.who} className={`p-2 border rounded cursor-pointer flex justify-between items-center ${selectedUser === g.who ? 'bg-blue-50' : ''}`} onClick={() => selectConversation(g.who)}>
                    <div>
                      <div className="text-sm font-medium">{g.displayName}</div>
                      <div className="text-xs text-gray-600">{(g.lastMsg && g.lastMsg.text ? String(g.lastMsg.text).slice(0,60) : '')}</div>
                      <div className="text-xs text-gray-400">{g.lastDate ? g.lastDate.toLocaleString() : ''}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {unread[g.who] ? <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{unread[g.who]}</div> : null}
                    </div>
                  </div>
                ));
              return processed;
            })()}
            {/* Conversation detail in left column when a conversation is selected */}
            <div className="mt-3">
              {selectedUser ? (
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Conversation — {usersMap[selectedUser] || selectedUser}</div>
                    <div className="flex items-center gap-2">
                      <button title="View profile" className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700" onClick={() => openProfile(selectedUser)}>Profile</button>
                      <button title="View history" className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700" onClick={() => openHistory(selectedUser)}>History</button>
                      <button title="Block user" className="text-xs px-2 py-1 border rounded bg-red-100 text-red-700" onClick={async () => { try { await blockUser(selectedUser); alert('User blocked'); } catch (err) { console.error(err); alert('Failed to block user'); } }}>Block</button>
                      <button title="Flag conversation" className="text-xs px-2 py-1 border rounded bg-yellow-100 text-yellow-700" onClick={async () => { try { await flagConversation(selectedUser); alert('Conversation flagged'); } catch (err) { console.error(err); alert('Failed to flag'); } }}>Flag</button>
                      <select className="text-sm border px-2 py-1 bg-white dark:bg-gray-700" value={(statuses[selectedUser] && statuses[selectedUser].status) ? statuses[selectedUser].status : 'open'} onChange={async (e) => { try { await setConversationStatus(selectedUser, e.target.value); const ns = await listConversationStatuses(); setStatuses(ns || {}); } catch (err) { console.error(err); } }}>
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {convMsgs.length === 0 && <div className="text-sm text-gray-500">No messages in this conversation.</div>}
                    {convMsgs.map(m => (
                      <div key={m._id || Math.random()} className={`p-2 rounded ${m.from === 'admin' ? 'ml-auto bg-blue-50 text-right' : 'bg-gray-100 text-left'}`}>
                        <div className="text-xs text-gray-500 mb-1">{m.from}{m.meta && m.meta.deviceId ? ` • ${m.meta.deviceId}` : ''}</div>
                        <div className="text-sm text-gray-800">{m.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No conversation selected.</div>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col">
          <div className="flex-1 overflow-auto mb-4 max-h-96 flex flex-col gap-2">
            {(selectedUser ? convMsgs : allMsgs).map(m => (
              <div key={m._id || Math.random()} className={`p-2 rounded max-w-3/4 ${m.from === 'admin' ? 'ml-auto bg-blue-50 text-right' : 'bg-gray-100 text-left'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">{m.from}{m.meta && m.meta.deviceId ? ` • ${m.meta.deviceId}` : ''}{m.createdAt ? ` • ${new Date(m.createdAt).toLocaleString()}` : ''}</div>
                  <div className="flex items-center gap-1">
                    <button title="Delete message" className="text-xs px-1 py-0.5 border rounded text-red-600" onClick={async (ev) => { ev.stopPropagation(); try { await deleteMessage(m._id); setAllMsgs(prev => prev.filter(x => x._id !== m._id)); setConvMsgs(prev => prev.filter(x => x._id !== m._id)); } catch (err) { console.error(err); alert('Failed to delete'); } }}>Del</button>
                    <button title="Flag message" className="text-xs px-1 py-0.5 border rounded text-yellow-700" onClick={async (ev) => { ev.stopPropagation(); try { await flagConversation(m.conversationId || m.from || m.to); alert('Conversation flagged'); } catch (err) { console.error(err); alert('Failed to flag'); } }}>Flag</button>
                  </div>
                </div>
                <div className="text-sm text-gray-800">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <div className="flex items-start gap-2">
              <textarea className="flex-1 border p-2 rounded" rows={2} value={text} onChange={e=>setText(e.target.value)} />
              <button className="p-3 rounded bg-blue-600 text-white flex items-center justify-center" onClick={()=>handleSend()} aria-label="Send">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">Selected: {selectedUser || 'All'}</div>
          </div>
        </div>
      </div>
      {/* Monitoring bar */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white dark:bg-gray-800 rounded shadow">Active chats: <strong>{Array.from(new Set(allMsgs.map(m => m.conversationId || m.from || m.to || 'unknown'))).length}</strong></div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded shadow">Avg. response: <strong>{(() => {
            try {
              const convs: Record<string, any[]> = {};
              allMsgs.forEach(m => { const k = m.conversationId || m.from || m.to || 'unknown'; (convs[k] = convs[k]||[]).push(m); });
              const deltas: number[] = [];
              Object.values(convs).forEach(arr => {
                arr.sort((a,b) => new Date(a.createdAt||Date.now()).getTime() - new Date(b.createdAt||Date.now()).getTime());
                for (let i=0;i<arr.length-1;i++) {
                  const a = arr[i], b = arr[i+1];
                  if (a.from !== 'admin' && b.from === 'admin') {
                    const ta = new Date(a.createdAt||Date.now()).getTime();
                    const tb = new Date(b.createdAt||Date.now()).getTime();
                    deltas.push(tb-ta);
                  }
                }
              });
              if (deltas.length === 0) return '-';
              const avg = Math.round((deltas.reduce((s,n)=>s+n,0)/deltas.length)/1000);
              return `${avg}s`;
            } catch (e) { return '-'; }
          })()}</strong></div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded" onClick={async ()=>{ try { const s = await getChatStats(); setStats(s || {}); setShowStatsModal(true); } catch(e){ console.warn(e); setShowStatsModal(true);} }}>View Dashboard</button>
          <label className="flex items-center gap-2"><input type="checkbox" checked={soundOn} onChange={e=>setSoundOn(e.target.checked)} /> Sound</label>
        </div>
      </div>

      {/* Stats modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold">Chat Statistics</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setShowStatsModal(false)} className="px-2 py-1 border rounded">Close</button>
              </div>
            </div>
            <div className="space-y-2">
              <div>Active chats: <strong>{stats?.activeChats ?? Array.from(new Set(allMsgs.map(m => m.conversationId || m.from || m.to || 'unknown'))).length}</strong></div>
              <div>Messages last 24h: <strong>{stats?.messagesLast24h ?? '-'}</strong></div>
              <div>Avg response time: <strong>{stats?.avgResponseTime ?? '-'}</strong></div>
              <div>Messages per day: <strong>{stats?.messagesPerDay ? JSON.stringify(stats.messagesPerDay) : '-'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* New message alert */}
      {newMessageAlert && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded shadow">{newMessageAlert}</div>
      )}

      {/* Profile modal */}
      {showProfile && profileUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-96">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">User Profile</div>
              <button onClick={() => setShowProfile(false)} className="text-sm px-2">Close</button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {profileUser.fullName || profileUser._id}</div>
              <div><strong>Email:</strong> {profileUser.email || '-'}</div>
              <div><strong>Phone:</strong> {profileUser.phone || '-'}</div>
              <div><strong>Telegram:</strong> {profileUser.telegramUsername || profileUser.telegramChatId || '-'}</div>
              <div><strong>Roles:</strong> {(profileUser.roles || []).join(', ') || '-'}</div>
            </div>
          </div>
        </div>
      )}
      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Conversation History</div>
              <button onClick={() => setShowHistory(false)} className="text-sm px-2">Close</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-auto">
              {historyMsgs.length === 0 && <div className="text-sm text-gray-500">No history available.</div>}
              {historyMsgs.map(m => (
                <div key={m._id || Math.random()} className={`p-2 rounded ${m.from === 'admin' ? 'ml-auto bg-blue-50 text-right' : 'bg-gray-100 text-left'}`}>
                  <div className="text-xs text-gray-500 mb-1">{m.from}{m.meta && m.meta.deviceId ? ` • ${m.meta.deviceId}` : ''} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</div>
                  <div className="text-sm text-gray-800">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
