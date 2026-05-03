import React, { useEffect, useState } from 'react';
import adminService from '../services/admin';
import { useConfirm } from '../contexts/ConfirmContext';
import { uploadFile } from '../services/uploads';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ErrorBoundary';
import Button from '../components/Button';
import ImageUploader from '../components/ImageUploader';

type ContentItem = {
  id: string;
  type: string;
  title: string;
  body?: string;
  language?: string;
  meta?: any;
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  imageUrl?: string | null;
  caption?: string | null;
  pinned?: boolean;
  reminderSent?: boolean;
};

export default function Content(){
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getContent();
      setItems(res);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load content');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const confirm = useConfirm();
  const save = async (item: Partial<ContentItem>) => {
    try {
      if (item.id) {
        await adminService.updateContent(item.id, item);
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Updated' } })); } catch (e) {}
      } else {
        await adminService.createContent(item);
        try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Created' } })); } catch (e) {}
      }
      setEditing(null);
      setCreating(false);
      await load();
    } catch (e) {
      console.error(e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Save failed' } })); } catch (e) {}
    }
  };

  const remove = async (id: string) => {
    const ok = await confirm({ title: 'Delete content', message: 'Delete this content item?', confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      await adminService.deleteContent(id);
      await load();
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Deleted' } })); } catch (e) {}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Delete failed' } })); } catch (e) {} }
  };

  return (
        <ErrorBoundary>
          <div id="main" className="mt-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          {loading && <Loading />}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && items.length === 0 && <div className="text-sm text-gray-600">No content items yet.</div>}

          {!loading && !error && items.length > 0 && (
            <ul className="space-y-2">
              {items.map(it => (
                <li key={it.id} className="p-3 border rounded flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{it.title} <span className="text-xs ml-2 text-gray-500">({it.type} / {it.language})</span></div>
                      {it.startAt && new Date(it.startAt) > new Date() && <div className="text-xs bg-yellow-100 px-2 py-0.5 rounded">Scheduled</div>}
                      {it.pinned && <div className="text-xs bg-blue-100 px-2 py-0.5 rounded">Pinned</div>}
                      {it.reminderSent && <div className="text-xs bg-red-100 px-2 py-0.5 rounded">Reminder sent</div>}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{it.published ? 'Published' : 'Draft'}</div>
                    {it.imageUrl && <img loading="lazy" decoding="async" src={it.imageUrl} alt={it.caption || it.title || 'content image'} className="w-32 h-20 object-cover rounded mt-2" />}
                    <div className="text-sm text-gray-700 mt-1">{it.body ? (it.body.length > 200 ? it.body.slice(0,200)+'...' : it.body) : '—'}</div>
                    <div className="text-xs text-gray-400 mt-2">Updated: {it.updatedAt || it.createdAt || '—'}</div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={()=>setEditing(it)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={()=>remove(it.id)}>Delete</button>
                    {it.reminderSent && <button className="px-2 py-1 bg-yellow-600 text-white rounded" onClick={async ()=>{ try { await adminService.updateContent(it.id, { reminderSent: false }); await load(); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Reminder flag cleared' } })); } catch(e){} } catch(e){ try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed' } })); } catch(e){} } }}>Clear reminder</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(creating || editing) && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 rounded w-full max-w-2xl max-h-[90vh] flex flex-col shadow-lg">
              <div className="px-6 pt-6">
                <h3 className="text-lg font-semibold mb-3">{editing ? 'Edit Content' : 'New Content'}</h3>
              </div>
              <div className="px-6 pb-6 overflow-auto" style={{ maxHeight: '70vh' }}>
                <ContentForm initial={editing || { type: 'announcement', title: '', body: '', language: 'en', published: false, startAt: null, endAt: null, imageUrl: null, caption: null, pinned: false, reminderSent: false }} onCancel={()=>{ setEditing(null); setCreating(false); }} onSave={save} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function ContentForm({ initial, onCancel, onSave }: { initial: any; onCancel: ()=>void; onSave: (item: any)=>void }){
  const [item, setItem] = useState(initial);
  useEffect(()=>{ setItem(initial); }, [initial]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm">Type</label>
        <select value={item.type} onChange={(e)=>setItem({...item, type: e.target.value})} className="w-full border px-2 py-1">
          <option value="announcement">Announcement</option>
          <option value="help">Help</option>
          <option value="translation">Translation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Title</label>
        <input className="w-full border px-2 py-1" value={item.title} onChange={(e)=>setItem({...item, title: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm">Language</label>
        <input className="w-full border px-2 py-1" value={item.language} onChange={(e)=>setItem({...item, language: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm">Body</label>
        <textarea className="w-full border px-2 py-1" value={item.body} onChange={(e)=>setItem({...item, body: e.target.value})} rows={6}></textarea>
      </div>

      <div>
        <label className="block text-sm">Image (optional)</label>
        <ImageUploader
          accept="image/*"
          maxWidth={1200}
          initialQuality={0.85}
          uploadLabel="Attach image"
          onUpload={async (f)=>{
            try {
              const res = await uploadFile(f as File);
              setItem({...item, imageUrl: res.url});
            } catch (err) { console.error('upload failed', err); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Upload failed' } })); } catch(e){} }
          }}
        />
        {item.imageUrl && <div className="mt-2"><img loading="lazy" decoding="async" src={item.imageUrl} alt={item.caption || item.title || 'content preview'} className="w-48 h-28 object-cover rounded" /></div>}
      </div>

      <div>
        <label className="block text-sm">Image caption (optional)</label>
        <input className="w-full border px-2 py-1" value={item.caption || ''} onChange={(e)=>setItem({...item, caption: e.target.value || null})} />
      </div>

      <div className="flex items-center gap-3">
        <input id="pinned" type="checkbox" checked={!!item.pinned} onChange={(e)=>setItem({...item, pinned: e.target.checked})} />
        <label htmlFor="pinned" className="text-sm">Pin to top</label>
      </div>

      <div>
        <label className="block text-sm">Display Start (optional)</label>
        <input type="datetime-local" className="w-full border px-2 py-1" value={item.startAt || ''} onChange={(e)=>setItem({...item, startAt: e.target.value || null})} />
      </div>

      <div>
        <label className="block text-sm">Display End (optional)</label>
        <input type="datetime-local" className="w-full border px-2 py-1" value={item.endAt || ''} onChange={(e)=>setItem({...item, endAt: e.target.value || null})} />
      </div>

      <div className="flex items-center gap-3">
        <input id="published" type="checkbox" checked={!!item.published} onChange={(e)=>setItem({...item, published: e.target.checked})} />
        <label htmlFor="published" className="text-sm">Published</label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="secondary" onClick={()=>{ setItem({...item, published: true}); onSave({...item, published: true}); }}>Publish</Button>
        <Button variant="secondary" onClick={()=>{ setItem({...item, published: true}); onSave({...item, published: true}); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'Scheduled for publish at the selected start time' } })); } catch(e){} }}>Schedule Publish</Button>
        <Button variant="primary" onClick={()=>onSave(item)}>Save</Button>
      </div>
    </div>
  );
}
