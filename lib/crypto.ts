const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function encrypt(text: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv },
    key,
    encoded
  )
  
  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer)
  }
}

export async function decrypt(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: base64ToArrayBuffer(iv) },
    key,
    base64ToArrayBuffer(ciphertext)
  )
  
  return new TextDecoder().decode(decrypted)
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

export async function importKey(keyData: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    base64ToArrayBuffer(keyData),
    { name: ALGORITHM },
    false,
    ['decrypt']
  )
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer
}