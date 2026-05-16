import { Context, Plugin } from '@/scripts/types.ts';
import { randomSeeded, sample } from '@std/random';
import { getHashString, hash } from '@/utils/hash.ts';

const DEFAULT_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('');

const ATTR_REGEX = /(class|id|for)=["']([^"']+)["']/g;
const VAR_REGEX = /--([a-zA-Z0-9_-]+)/g;
const JS_ID_REGEX = /document\.getElementById\(["']([^"']+)["']\)/g;

/**
 * Converts a string into a 64-bit BigInt for use in the Deno random number generator.
 */
async function hashSeed(seed: string): Promise<bigint> {
  const hashArray = (await hash(seed)).subarray(0, 8);
  return BigInt(`0x${getHashString(hashArray)}`);
}

/**
 * Provides a unique short name that corresponds to the given index.
 *
 * Example (a-z):
 *  0 -> a,
 *  26 -> aa
 */
function generateShortName(index: number, charset: string[]): string {
  let name = '';
  let i = index;
  while (i >= 0) {
    name = charset[i % charset.length] + name;
    i = Math.floor(i / charset.length) - 1;
  }
  return name;
}

async function getShuffledCharset(
  seed: string,
  charset: string[] = DEFAULT_CHARSET,
): Promise<string[]> {
  const prng = randomSeeded(await hashSeed(seed));
  const shuffledCharset: string[] = [];
  const tempCharset = [...charset];

  while (tempCharset.length > 0) {
    const char = sample(tempCharset, { prng });
    if (char) {
      shuffledCharset.push(char);
      tempCharset.splice(tempCharset.indexOf(char), 1);
    }
  }

  return shuffledCharset;
}

function getClassMap(
  htmlContent: string,
  charset: string[],
): Map<string, string> {
  const classMap = new Map<string, string>();

  let counter = 0;
  const getShortName = (original: string): string => {
    if (!classMap.has(original)) {
      classMap.set(original, generateShortName(counter++, charset));
    }
    return classMap.get(original)!;
  };

  const attrMatches = [...htmlContent.matchAll(ATTR_REGEX)];
  for (const [_, type, value] of attrMatches) {
    if (type === 'class') {
      value.split(/\s+/).filter(Boolean).forEach(getShortName);
    } else {
      getShortName(value);
    }
  }

  const varMatches = [...htmlContent.matchAll(VAR_REGEX)];
  for (const [_, varName] of varMatches) {
    getShortName(`--${varName}`);
  }

  const jsMatches = [...htmlContent.matchAll(JS_ID_REGEX)];
  for (const [_, idValue] of jsMatches) {
    getShortName(idValue);
  }

  return classMap;
}

function replaceMatches(content: string, classMap: Map<string, string>) {
  let processed = content.replace(ATTR_REGEX, (_, type, value) => {
    if (type === 'class') {
      const shortened = value.split(/\s+/).map((c: string) =>
        classMap.get(c) || c
      );
      return `${type}="${shortened.join(' ')}"`;
    }
    return `${type}="${classMap.get(value) || value}"`;
  });

  processed = processed.replace(VAR_REGEX, (_, varName) => {
    const shortened = classMap.get(`--${varName}`) || varName;
    return `--${shortened}`;
  });

  for (const [original, shortened] of classMap.entries()) {
    if (!original.startsWith('--')) {
      const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cssPattern = new RegExp(`([.#])${escaped}(?![a-zA-Z0-9_-])`, 'g');
      processed = processed.replace(cssPattern, `$1${shortened}`);
    }
  }

  processed = processed.replace(JS_ID_REGEX, (match, idValue) => {
    const shortened = classMap.get(idValue) || idValue;
    return match.replace(idValue, shortened);
  });

  return { processed: processed, classMap: Object.fromEntries(classMap) };
}

/** @internal */
export async function mangleCssInternal(
  content: string,
  seed: string,
) {
  const charset = await getShuffledCharset(seed);
  const classMap = getClassMap(content, charset);
  return replaceMatches(content, classMap);
}

const mangleCss: Plugin = {
  name: 'CSS Mangler',
  async transform(context: Context) {
    const processed = (await mangleCssInternal(
      context.value,
      (context.store.seed as { full: string }).full,
    )).processed;
    const newContext = {
      value: processed,
      store: context.store,
    };
    return newContext;
  },
};
export default mangleCss;
