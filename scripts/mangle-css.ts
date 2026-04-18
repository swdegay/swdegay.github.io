import { randomSeeded, sample } from '@std/random';

const DEFAULT_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('');

const ATTR_REGEX = /(class|id|for)=["']([^"']+)["']/g;
const VAR_REGEX = /--([a-zA-Z0-9_-]+)/g;

/**
 * Converts a string into a 64-bit BigInt for use in the Deno random number generator.
 */
async function hashSeed(seed: string): Promise<bigint> {
  const msgUint8 = new TextEncoder().encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.slice(0, 8).map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return BigInt(`0x${hex}`);
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

  return { processed: processed, classMap: Object.fromEntries(classMap) };
}

export async function mangleCss(content: string, seed: string) {
  const charset = await getShuffledCharset(seed);
  const classMap = getClassMap(content, charset);
  return replaceMatches(content, classMap);
}
