import subsetFont from 'subset-font';
import { DOMParser } from '@b-fuze/deno-dom';
import { decodeBase64, encodeBase64 } from '@std/encoding/base64';
import { Context, Plugin } from '@/scripts/types.ts';

const TTF_REGEX =
  /src:\s*url\(['"]data:font\/ttf;base64,([^'"]+)['"]\)\s*format\(['"]truetype['"]\);/;

function extractUniqueCharacters(rawHtml: string): string | null {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
  const body = doc.querySelector('body');
  if (!body) return null;

  body.querySelectorAll('script').forEach((e) => e.remove());

  return [...new Set(body.textContent)].join('');
}

async function subsetToWoff2(
  charset: string,
  fontData: Uint8Array,
): Promise<string> {
  const subsetBuffer = await subsetFont(Buffer.from(fontData), charset, {
    targetFormat: 'woff2',
  });
  return `data:font/woff2;base64,${encodeBase64(subsetBuffer)}`;
}

export async function subset(rawHtml: string): Promise<string> {
  const charset = extractUniqueCharacters(rawHtml);
  const match = TTF_REGEX.exec(rawHtml);
  if (!charset || !match) return rawHtml;

  const [fullMatch, base64Content] = match;
  const woff2Url = await subsetToWoff2(charset, decodeBase64(base64Content));

  return rawHtml.replace(fullMatch, `src: url('${woff2Url}') format('woff2');`);
}

const subsetFonts: Plugin = {
  name: 'Font Subset',
  async transform({ value, store }: Context) {
    return { value: await subset(value), store };
  },
};
export default subsetFonts;
