export async function hash(data: string): Promise<Uint8Array> {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return new Uint8Array(hashBuffer);
}

export function getHashString(hash: Uint8Array): string {
  return Array.from(hash)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}
