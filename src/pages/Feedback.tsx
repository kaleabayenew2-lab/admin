import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { API_BASE } from '../services/api';

let feedbackSse: EventSource | null = null;

type FeedbackItem = {
  id: string;
  name?: string;
  email?: string;
  message: string;
  createdAt: string;
  sourceIp?: string;
  replied?: boolean;
  reply?: string | null;
  replyMethod?: string | null;
  repliedAt?: string | null;
  attachments?: Array<{ url?: string; filename?: string; type?: string } | string>;
};

export default function Feedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [replying, setReplying] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
    const res = await api.get('/api/feedback');
      if (res.data && res.data.feedbacks) setItems(res.data.feedbacks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    try {
      const esUrl = `${API_BASE.replace(/\/$/, '')}/api/notifications/stream`;
      const es = new EventSource(esUrl);
      es.addEventListener('notification', (ev: any) => {
        try {
          const data = JSON.parse(ev.data);
          // if this is a feedback-originated notification, add to list
          if (data && (data.type === 'feedback' || data.type === 'feedback_submission') && data.feedbackId) {
            const fb: FeedbackItem = {
              id: String(data.feedbackId),
              name: data.fromName || undefined,
              email: undefined,
              message: data.text || data.message || '',
              createdAt: data.createdAt || new Date().toISOString(),
              sourceIp: undefined,
              replied: false,
              reply: null,
              replyMethod: null,
              repliedAt: null,
              attachments: data.attachments || [],
            };
            setItems(prev => [fb, ...prev]);
          }
        } catch (e) { /* ignore */ }
      });
      feedbackSse = es;
    } catch (e) { console.warn('Feedback SSE not available', e); }
    return () => { try { if (feedbackSse) feedbackSse.close(); } catch(e){} };
  }, []);

  const sendReply = async (id: string) => {
    const text = (replyText[id] || '').trim();
    if (!text) return;
    setReplying(prev => ({ ...prev, [id]: true }));
    try {
      const res = await api.post(`/api/feedback/${id}/reply`, { reply: text, method: 'admin:ui' });
      if (res.data && res.data.entry) {
        setItems(prev => prev.map(it => (it.id === id ? res.data.entry : it)));
        setReplyText(prev => ({ ...prev, [id]: '' }));
      }
    } catch (err) {
      console.error(err);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to send reply' } })); } catch(e){}
    } finally {
      setReplying(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div id="main" className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Feedback & Reviews</h2>
      <p className="mb-4">View and reply to user feedback submitted from the app.</p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && <div className="text-sm text-gray-600">No feedback yet.</div>}
          {items.map(item => (
            <div key={item.id} className="border rounded p-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{item.name || item.email || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gray-500">{item.sourceIp || ''}</div>
              </div>
              <div className="mt-2 whitespace-pre-wrap">{item.message}</div>
              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.attachments.map((a: any, i: number) => (
                    <a key={i} href={a.url || a} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">{a.filename || a.url || 'attachment'}</a>
                  ))}
                </div>
              )}

              <div className="mt-3">
                {item.replied ? (
                  <div className="bg-green-50 border border-green-100 p-2 rounded">
                    <div className="text-sm font-medium text-green-800">Replied ({item.replyMethod})</div>
                    <div className="text-sm text-gray-800 mt-1">{item.reply}</div>
                    {item.repliedAt && <div className="text-xs text-gray-500 mt-1">{new Date(item.repliedAt).toLocaleString()}</div>}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Write a reply..."
                      value={replyText[item.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="flex-1 border rounded p-2 text-sm"
                    />
                    <button
                      className="bg-blue-600 text-white px-3 py-2 rounded"
                      onClick={() => sendReply(item.id)}
                      disabled={!!replying[item.id]}
                    >
                      {replying[item.id] ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
