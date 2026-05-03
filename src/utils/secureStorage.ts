const encoder = (s: string) => new TextEncoder().encode(s);
const decoder = (b: ArrayBuffer) => new TextDecoder().decode(b);

const PASSPHRASE = 'findmed_admin_secret_v1';
const SALT = 'findmed_salt_v1';

async function getKey() {
  const passKey = await crypto.subtle.importKey('raw', encoder(PASSPHRASE), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder(SALT), iterations: 120000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buf: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function encryptString(plain: string) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder(plain));
  // store iv + ciphertext
  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.byteLength);
  return toBase64(combined.buffer);
}

export async function decryptString(dataB64: string) {
  try {
    const raw = new Uint8Array(fromBase64(dataB64));
    const iv = raw.slice(0, 12);
    const ct = raw.slice(12).buffer;
    const key = await getKey();
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return decoder(decrypted);
  } catch (e) {
    return null;
  }
}
