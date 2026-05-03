import React, { useEffect, useState } from 'react';
import { compressImageFile } from '../services/uploads';

export default function ImageUploader({
  accept = 'image/*',
  maxWidth = 1600,
  initialQuality = 0.85,
  onUpload,
  uploadLabel = 'Upload',
}: {
  accept?: string;
  maxWidth?: number;
  initialQuality?: number;
  onUpload: (file: File) => Promise<any>;
  uploadLabel?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(initialQuality);
  const [compressed, setCompressed] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); setCompressed(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    (async () => {
      try {
        const c = await compressImageFile(file, maxWidth, quality);
        setCompressed(c as File);
        setMessage(`Original: ${Math.round(file.size/1024)} KB — Compressed: ${Math.round((c as File).size/1024)} KB`);
      } catch (e) {
        setCompressed(null);
        setMessage('Compression failed — will upload original');
      }
    })();
    return () => { URL.revokeObjectURL(url); };
  }, [file, quality, maxWidth]);

  const handleFile = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    setFile(f);
    setMessage(null);
  };

  const doUpload = async (useCompressed = true) => {
    if (!file) return;
    setBusy(true);
    try {
      const f = useCompressed && compressed ? compressed : file;
      await onUpload(f);
      setFile(null);
      setCompressed(null);
      setPreview(null);
      setMessage('Upload complete');
    } catch (e:any) {
      console.error('Upload failed', e);
      setMessage('Upload failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept={accept} onChange={handleFile} />
      {preview && (
        <div className="flex items-start gap-4">
          <img src={preview} alt="preview" className="w-32 h-24 object-cover rounded" />
          <div className="flex-1">
            <div className="text-sm text-gray-600">{message}</div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-sm">Quality</label>
              <input type="range" min={0.5} max={0.95} step={0.05} value={quality} onChange={(e)=>setQuality(parseFloat(e.target.value))} />
              <div className="text-xs text-gray-500">{Math.round(quality*100)}%</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button disabled={busy} className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>doUpload(true)}>{busy ? 'Uploading...' : `${uploadLabel} (compressed)`}</button>
              <button disabled={busy} className="px-3 py-1 bg-gray-300 rounded" onClick={()=>doUpload(false)}>{busy ? 'Uploading...' : `${uploadLabel} (original)`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
