import { dirname } from '@std/path/';

export async function exists(path: string): Promise<boolean> {
  try {
    const info = await Deno.lstat(path);
    return info.isFile;
  } catch {
    return false;
  }
}

export async function atomicWrite(path: string, data: string) {
  await Deno.mkdir(dirname(path), { recursive: true });

  const tempPath = `${path}.tmp`;
  await Deno.writeTextFile(tempPath, data);
  await Deno.rename(tempPath, path);
}
