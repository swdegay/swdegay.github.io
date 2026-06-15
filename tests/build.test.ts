import { assertEquals } from '@std/assert';
import { mangleCssInternal } from '@/plugins/css-mangle-plugin.ts';
import { minifyHtmlInternal } from '@/plugins/html-minify-plugin.ts';
import { optimizeSvgInternal } from '@/plugins/svg-optimize-plugin.ts';
import { renderInternal } from '@/plugins/template-render-plugin.ts';
import { getHashString, hash } from '@/utils/hash.ts';
import { getTimestamp } from '@/utils/time.ts';
import { injectUmamiScript } from '@/plugins/umami-analytics-plugin.ts';
import { join } from '@std/path/join';
import { encodeBase64 } from '@std/encoding/base64';
import { getFontCss } from '@/plugins/font-bundle-plugin.ts';
import { subset } from '@/plugins/font-subset-plugin.ts';

const COMMIT_HASH = '610dac2fabc687ae9ea6bb65e6cd89e55350c992';
const TEMP_DIR = './.tmp';
const FIXED_TIMESTAMP = Temporal.Instant.from('1970-01-01T00:00:00Z');

function makeSeed(commitHash: string) {
  return { full: commitHash, short: commitHash.slice(0, 7) };
}

async function loadAssets() {
  const [lightIcon, darkIcon, userDataRaw, roboFontRaw] = await Promise.all([
    Deno.readTextFile('./src/light_mode.svg'),
    Deno.readTextFile('./src/dark_mode.svg'),
    Deno.readTextFile('./data/userdata.json'),
    Deno.readFile('./src/fonts/RobotoMono-Regular.ttf'),
  ]);
  return {
    lightIcon,
    darkIcon,
    userData: JSON.parse(userDataRaw),
    bundle_font_css: getFontCss(encodeBase64(roboFontRaw), 'RoboSubset'),
  };
}

async function runBuildPipeline(
  assets: Awaited<ReturnType<typeof loadAssets>>,
  seed: ReturnType<typeof makeSeed>,
): Promise<string> {
  const assembled = await renderInternal({
    ...assets.userData,
    seed,
    timestamp: getTimestamp(FIXED_TIMESTAMP),
    light_mode_icon: optimizeSvgInternal(assets.lightIcon),
    dark_mode_icon: optimizeSvgInternal(assets.darkIcon),
    bundle_font_css: assets.bundle_font_css,
  });

  const { processed: mangled } = await mangleCssInternal(assembled, seed.full);
  const withAnalytics = injectUmamiScript(
    mangled,
    assets.userData.umami_website_id,
  );
  const subsetted = await subset(withAnalytics);
  return minifyHtmlInternal(subsetted);
}

async function computeHash(content: string): Promise<string> {
  return getHashString(await hash(content));
}

Deno.test('should produce consistent builds with the same seed', async () => {
  const seed = makeSeed(COMMIT_HASH);
  const assets = await loadAssets();

  const expectedHtml = await runBuildPipeline(assets, seed);
  const expectedHash = await computeHash(expectedHtml);

  Deno.env.set('COMMIT_HASH', COMMIT_HASH);
  Deno.env.set('GITHUB_ACTIONS', 'true');
  Deno.env.set('OUTPUT_DIR', TEMP_DIR);

  try {
    const { build } = await import('@/scripts/build.ts');
    await build();

    const actualHtml = await Deno.readTextFile(
      join(TEMP_DIR, 'index.min.html'),
    );
    const actualHash = await computeHash(actualHtml);

    assertEquals(actualHash, expectedHash);
    try {
      await Deno.remove(TEMP_DIR, { recursive: true });
      // deno-lint-ignore no-empty
    } catch {}
  } finally {
    Deno.env.delete('COMMIT_HASH');
    Deno.env.delete('GITHUB_ACTIONS');
    Deno.env.delete('OUTPUT_DIR');
  }
});
