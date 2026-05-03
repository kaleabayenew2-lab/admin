import Button from '../components/Button';
import React, { useEffect, useState } from 'react';
import adminService from '../services/admin';
import { useConfirm } from '../contexts/ConfirmContext';
import facilitiesService, { Facility } from '../services/facilities';

export default function EmergencyManagement(){
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [filter, setFilter] = useState<'all'|'hospital'|'pharmacy'|'emergency'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const confirm = useConfirm();
  const load = async () => {
    setLoading(true);
    try {
      const list = await facilitiesService.listFacilities();
      setFacilities(list);
    } catch (e) {
      console.error(e);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed to load facilities' } })); } catch (e) {}
    } finally { setLoading(false); }
  };


  useEffect(()=>{ load(); }, []);

  const visible = facilities.filter(f => (
    filter === 'all' ? true : filter === 'emergency' ? !!f.isEmergency : f.type === filter
  ));

  const toggleSelect = (id: string) => {
    setSelectedIds(s => s.includes(id) ? s.filter(x=>x!==id) : s.concat([id]));
  };

  const bulkSetEmergency = async (isEmergency: boolean) => {
    if (selectedIds.length === 0) { try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'warning', message: 'No facilities selected' } })); } catch(e){}; return; }
    const ok = await confirm({ title: 'Set emergency', message: `Set ${selectedIds.length} facilities as ${isEmergency ? 'emergency' : 'non-emergency'}?`, confirmText: 'Yes', cancelText: 'Cancel', danger: false });
    if (!ok) return;
    try {
      await adminService.bulkUpdateEmergencies(selectedIds, isEmergency);
      setSelectedIds([]);
      await load();
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Updated' } })); } catch(e){}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Update failed' } })); } catch(e){} }
  };

  const saveFacility = async (f: Facility) => {
    try {
      await facilitiesService.updateFacility(f._id, f as any);
      setSelected(null);
      await load();
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Saved' } })); } catch(e){}
    } catch (e) { console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Save failed' } })); } catch(e){} }
  };

  return (
    <div id="main" className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Emergency Facility Management</h2>
      <p className="mb-4">Tag emergency hospitals, update contacts, and prioritize emergency services.</p>

      <div className="mb-4 flex items-center gap-3">
        <div className="inline-flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} onClick={()=>setFilter('all')}>All</Button>
          <Button variant={filter === 'hospital' ? 'primary' : 'ghost'} onClick={()=>setFilter('hospital')}>Hospitals</Button>
          <Button variant={filter === 'pharmacy' ? 'primary' : 'ghost'} onClick={()=>setFilter('pharmacy')}>Pharmacies</Button>
          <Button variant={filter === 'emergency' ? 'primary' : 'ghost'} onClick={()=>setFilter('emergency')}>Emergencies</Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="primary" onClick={()=>bulkSetEmergency(true)}>Mark Selected Emergency</Button>
          <Button variant="secondary" onClick={()=>bulkSetEmergency(false)}>Clear Selected Emergency</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        {loading && <div>Loading...</div>}
        {!loading && visible.length === 0 && <div>No facilities matching filter.</div>}
        {!loading && visible.length > 0 && (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Select</th>
                <th className="px-2 py-1">Name</th>
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Phone</th>
                <th className="px-2 py-1">Emergency</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f, idx) => (
                <tr key={f._id} className="border-t">
                  <td className="px-2 py-1">{idx+1}</td>
                  <td className="px-2 py-1 text-center"><input type="checkbox" checked={selectedIds.includes(f._id)} onChange={()=>toggleSelect(f._id)} /></td>
                  <td className="px-2 py-1">{f.name}</td>
                  <td className="px-2 py-1">{f.type}</td>
                  <td className="px-2 py-1">{f.phone || '—'}</td>
                  <td className="px-2 py-1">{f.isEmergency ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1">
                    <button className="mr-2 px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>setSelected(f)}>Edit</button>
                    <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={async ()=>{ try{ await facilitiesService.updateFacility(f._id, { isEmergency: !f.isEmergency }); await load(); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Toggled' } })); } catch(e){} } catch(e){ console.error(e); try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: 'Failed' } })); } catch(e){} }}}>Toggle Emergency</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-facility-title" className="bg-white dark:bg-gray-800 p-6 rounded w-full max-w-lg">
            <h3 id="edit-facility-title" className="text-lg font-semibold mb-3">Edit Facility</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input className="w-full border px-2 py-1" value={selected.name || ''} onChange={(e)=>setSelected({...selected, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm">Phone</label>
                <input className="w-full border px-2 py-1" value={selected.phone || ''} onChange={(e)=>setSelected({...selected, phone: e.target.value})} />
              </div>
              <div className="flex items-center gap-3">
                <label className="mr-3">Emergency</label>
                <input type="checkbox" checked={!!selected.isEmergency} onChange={(e)=>setSelected({...selected, isEmergency: e.target.checked})} />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="secondary" onClick={()=>setSelected(null)}>Cancel</Button>
              <Button variant="primary" onClick={()=>saveFacility(selected)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
