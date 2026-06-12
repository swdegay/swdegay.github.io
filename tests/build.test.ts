import { assertEquals } from '@std/assert';
import { mangleCssInternal } from '@/plugins/css-mangle-plugin.ts';
import { minifyHtmlInternal } from '@/plugins/html-minify-plugin.ts';
import { optimizeSvgInternal } from '@/plugins/svg-optimize-plugin.ts';
import { renderInternal } from '@/plugins/template-render-plugin.ts';
import { getHashString, hash } from '@/utils/hash.ts';
import { getTimestamp } from '@/utils/time.ts';
import { injectUmamiScript } from '@/plugins/umami-analytics-plugin.ts';
import { join } from '@std/path/join';

Deno.test('should produce consistent builds with the same seed', async () => {
  // setup
  const commitHash = '610dac2fabc687ae9ea6bb65e6cd89e55350c992';
  const seed = {
    full: commitHash,
    short: commitHash.slice(0, 7),
  };

  // raw assets
  const rawLightIcon = await Deno.readTextFile('./src/light_mode.svg');
  const rawDarkIcon = await Deno.readTextFile('./src/dark_mode.svg');
  const userData = JSON.parse(await Deno.readTextFile('./data/userdata.json'));

  // manual build pipeline
  const lightModeIcon = optimizeSvgInternal(rawLightIcon);
  const darkModeIcon = optimizeSvgInternal(rawDarkIcon);

  const timestamp = Temporal.Instant.from('1970-01-01T00:00:00Z');

  const assembledHtml = await renderInternal({
    ...userData,
    seed,
    timestamp: getTimestamp(timestamp),
    light_mode_icon: lightModeIcon,
    dark_mode_icon: darkModeIcon,
  });

  const { processed: mangledHtml } = await mangleCssInternal(
    assembledHtml,
    seed.full,
  );
  const withAnalytics = injectUmamiScript(
    mangledHtml,
    userData.umami_website_id,
  );
  const optimizedHtml = minifyHtmlInternal(withAnalytics);

  const testBuildHash = getHashString(await hash(optimizedHtml));

  // actual build pipeline
  Deno.env.set('COMMIT_HASH', commitHash);
  Deno.env.set('GITHUB_ACTIONS', 'true');

  const tempDir = './.tmp';
  Deno.env.set('OUTPUT_DIR', tempDir);

  try {
    const { build } = await import('@/scripts/build.ts');
    await build();

    const minifiedBuild = await Deno.readTextFile(
      join(tempDir, 'index.min.html'),
    );
    const actualBuildHash = getHashString(await hash(minifiedBuild));

    assertEquals(actualBuildHash, testBuildHash);
  } finally {
    Deno.env.delete('COMMIT_HASH');
    Deno.env.delete('GITHUB_ACTIONS');
    Deno.env.delete('OUTPUT_DIR');
    Deno.remove(tempDir, { recursive: true });
  }
});
