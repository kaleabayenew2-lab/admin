import React from 'react';

export default function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean)=>void; label?: string }){
  return (
    <label className="inline-flex items-center gap-3">
      <span className="text-sm">{label}</span>
      <button type="button" aria-pressed={checked} onClick={()=>onChange(!checked)} className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}
