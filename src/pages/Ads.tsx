import React, { useEffect, useState } from 'react';
import { listAds, updateAd, createAd, deleteAd } from '../services/ads';
import api from '../services/api';
import { useConfirm } from '../contexts/ConfirmContext';
import ImageUploader from '../components/ImageUploader';

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [facilities, setFacilities] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await listAds();
      setAds(Array.isArray(data) ? data : []);
      // load facilities for picker
      try {
        const fres = await api.get('/api/facilities');
        if (fres && fres.data) setFacilities(Array.isArray(fres.data) ? fres.data : []);
      } catch (e) {}
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(a: any) {
    try {
      const updated = await updateAd(a._id, { active: !a.active });
      setAds((prev) => prev.map(x => x._id === a._id ? updated : x));
    } catch (e) { console.error(e); }
  }

  const confirm = useConfirm();
  async function remove(a: any) {
    const ok = await confirm({ title: 'Delete ad', message: 'Delete this ad?', confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      await deleteAd(a._id);
      setAds((prev) => prev.filter(x => x._id !== a._id));
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Deleted ad' } })); } catch (e) {}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to delete ad' } })); } catch(e){} }
  }

  // Removed unused addSample function

  function openEditor(a: any | null) {
    if (!a) {
      setEditing({ title: '', subtitle: '', kind: 'custom', facility: null, image: '', priority: 0, active: true });
    } else {
      setEditing({ ...a });
    }
  }

  async function saveAd() {
    if (!editing) return;
    try {
      setLoading(true);
      let saved;
      if (editing._id) {
        saved = await updateAd(editing._id, editing);
        setAds((prev) => prev.map(x => x._id === saved._id ? saved : x));
      } else {
        saved = await createAd(editing);
        setAds((prev) => [saved, ...prev]);
      }
      setEditing(null);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // Removed unused onFileChange function

  return (
    <div id="main" className="p-4">
      {loading ? <div>Loading...</div> : (
        <div className="space-y-2">
            {ads.map(a => (
              <div key={a._id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-gray-600">{a.subtitle}</div>
                  <div className="text-xs text-gray-500">Kind: {a.kind} {a.facility ? `• facility ${a.facility}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!a.active} onChange={() => toggleActive(a)} /> Active
                  </label>
                  <button className="btn-sm" onClick={() => openEditor(a)}>Edit</button>
                  <button className="btn-sm" onClick={() => remove(a)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div role="dialog" aria-modal="true" aria-labelledby="ad-editor-title" className="bg-white dark:bg-gray-800 p-4 rounded w-11/12 max-w-2xl">
              <h3 id="ad-editor-title" className="font-semibold mb-2">{editing._id ? 'Edit Ad' : 'New Ad'}</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm">Title</label>
                  <input className="w-full border p-2" value={editing.title || ''} onChange={e => setEditing({...editing, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm">Subtitle</label>
                  <input className="w-full border p-2" value={editing.subtitle || ''} onChange={e => setEditing({...editing, subtitle: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm">Kind</label>
                  <input className="w-full border p-2" value={editing.kind || ''} onChange={e => setEditing({...editing, kind: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm">Facility (optional)</label>
                  <select className="w-full border p-2" value={editing.facility || ''} onChange={e => setEditing({...editing, facility: e.target.value || null})}>
                    <option value="">-- none --</option>
                    {facilities.map(f => (
                      <option key={f._id} value={f._id}>{f.name || f._id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Image</label>
                  <div className="flex items-center gap-2">
                    <div style={{width: '100%'}}>
                      <ImageUploader
                        accept="image/*"
                        maxWidth={1200}
                        initialQuality={0.85}
                        uploadLabel="Attach"
                        onUpload={async (f)=>{
                          setLoading(true);
                          try {
                            const res = await (await import('../services/uploads')).uploadFile(f as File);
                            if (editing) { editing.image = res.url || ''; setEditing({...editing}); }
                          } finally { setLoading(false); }
                        }}
                      />
                    </div>
                  </div>
                    {editing.image ? <div className="mt-2"><img loading="lazy" decoding="async" src={editing.image} alt={editing.title || 'ad preview'} style={{maxHeight:120}} /></div> : null}
                </div>
                <div>
                  <label className="block text-sm">Priority (number)</label>
                  <input type="number" className="w-32 border p-2" value={editing.priority || 0} onChange={e => setEditing({...editing, priority: parseInt(e.target.value||'0',10)})} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.active} onChange={e=>setEditing({...editing, active: e.target.checked})}/> Active</label>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
                  <button className="btn" onClick={saveAd}>Save</button>
                </div>
                  <div className="mt-4">
                  <h4 className="font-semibold">Preview</h4>
                  <div className="p-3 border rounded flex items-center gap-3">
                    {editing.image ? <img loading="lazy" decoding="async" src={editing.image} alt={editing.title || 'ad preview small'} style={{height:64}} /> : <div className="w-16 h-16 bg-gray-200" />}
                    <div>
                      <div className="font-semibold">{editing.title}</div>
                      <div className="text-sm text-gray-600">{editing.subtitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
