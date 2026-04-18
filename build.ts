import { mangleCss } from '@/scripts/mangle-css.ts';
import { minifyHtml } from '@/scripts/minify-html.ts';
import { optimizeSvg } from '@/scripts/optimize-svg.ts';
import { render } from '@/scripts/template-engine.ts';

const COMMIT_HASH = Deno.env.get('COMMIT_HASH') ?? Deno.args[0];
const PATHS = {
  favicon: './src/favicon.svg',
  index: './src/index.eta',
  theme_css: './src/theme.css',
  main_css: './src/main.css',
  dist_final_index: './dist/index.min.html',
  dist_source_index: './dist/index.html',
  dist: './dist',
  userdata: './data/userdata.json',
};

const SVG_BASE64_REGEX = /^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/;
const GIT_HASH_REGEX = /^[0-9a-f]{40,64}$/i;

async function validateEnvironment() {
  if (!COMMIT_HASH || !GIT_HASH_REGEX.test(COMMIT_HASH)) {
    console.error('Invalid or missing commit hash.');
    Deno.exit(1);
  }

  const checks = await Promise.all([
    exists(PATHS.favicon),
    exists(PATHS.index),
    exists(PATHS.userdata),
    exists(PATHS.theme_css),
    exists(PATHS.main_css),
  ]);

  if (checks.includes(false)) {
    console.error('One or more source files are missing.');
    Deno.exit(1);
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    const info = await Deno.lstat(path);
    return info.isFile;
  } catch {
    return false;
  }
}

async function optimizeFavicon(): Promise<string> {
  const raw = await Deno.readTextFile(PATHS.favicon);
  const { processed } = await mangleCss(raw, COMMIT_HASH);
  const base64 = optimizeSvg(processed);

  if (!SVG_BASE64_REGEX.test(base64)) {
    console.error('SVG optimization failed.');
    Deno.exit(1);
  }

  return base64;
}

async function buildHtml(content: string): Promise<string> {
  const { processed: mangled } = await mangleCss(content, COMMIT_HASH);
  return await minifyHtml(mangled);
}

async function atomicWrite(path: string, data: string) {
  const tempPath = `${path}.tmp`;
  await Deno.writeTextFile(tempPath, data);
  await Deno.rename(tempPath, path);
}

await validateEnvironment();

const rawData = await Deno.readTextFile(`${PATHS.userdata}`);
const data = JSON.parse(rawData);
const favicon = await optimizeFavicon();

const injected = render({
  ...data,
  favicon: favicon,
  commit_hash: COMMIT_HASH,
});
const finalHtml = await buildHtml(injected);

await Deno.mkdir(`${PATHS.dist}`, { recursive: true });
await atomicWrite(`${PATHS.dist_source_index}`, injected);
await atomicWrite(`${PATHS.dist_final_index}`, finalHtml);
