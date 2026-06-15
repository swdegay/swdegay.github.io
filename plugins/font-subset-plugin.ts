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

  const scripts = body.querySelectorAll('script');
  for (const script of scripts) {
    script.remove();
  }
  const cleanText = body.textContent;

  return Array.from(new Set(cleanText)).join('');
}

async function _subset(
  charset: string,
  // deno-lint-ignore no-explicit-any
  nodeFontBuffer: Buffer<any>,
): Promise<string> {
  const subsetBuffer = await subsetFont(nodeFontBuffer, charset, {
    targetFormat: 'woff2',
  });

  const base64Font = encodeBase64(subsetBuffer);
  return `data:font/woff2;base64,${base64Font}`;
}

export async function subset(rawHtml: string): Promise<string> {
  const charset = extractUniqueCharacters(rawHtml);
  const ttfMatch = TTF_REGEX.exec(rawHtml);
  if (!charset || !ttfMatch) return rawHtml;

  const fullMatch = ttfMatch[0];

  const base64Content = ttfMatch[1];
  if (!base64Content) return rawHtml;
  const decodedFont = decodeBase64(base64Content);
  const nodeFontBuffer = Buffer.from(decodedFont);

  const subset = await _subset(charset, nodeFontBuffer);

  const newLine = `src: url('${subset}') format('woff2');`;
  return rawHtml.replace(fullMatch, newLine);
}

const subsetFonts: Plugin = {
  name: 'Font Subset',
  async transform(context: Context) {
    return { value: await subset(context.value), store: context.store };
  },
};
export default subsetFonts;
