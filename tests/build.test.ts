import { assertEquals } from '@std/assert';
import { mangleCssInternal } from '@/plugins/css-mangle-plugin.ts';
import { minifyHtmlInternal } from '@/plugins/html-minify-plugin.ts';
import { optimizeSvgInternal } from '@/plugins/svg-optimize-plugin.ts';
import { renderInternal } from '@/plugins/template-render-plugin.ts';
import { getHashString, hash } from '@/utils/hash.ts';
import { getTimestamp } from '@/utils/time.ts';

Deno.test('should produce consistent builds with the same seed', async () => {
  const timestamp = Temporal.Instant.from('1970-01-01T00:00:00Z');
  const expected =
    '9ab00127f87d8a37a2ce0a9e6afdfe7029fc6b4fd3e12224a75c746fed1df951';
  const commitHash = '610dac2fabc687ae9ea6bb65e6cd89e55350c992';
  const seed = {
    full: commitHash,
    short: commitHash.slice(0, 7),
  };
  const mangledFavicon = await mangleCssInternal(
    await Deno.readTextFile('./src/favicon.svg'),
    seed.full,
  );
  const favicon = optimizeSvgInternal(mangledFavicon.processed);
  const assembled = await renderInternal({
    ...JSON.parse(await Deno.readTextFile('./data/userdata.json')),
    favicon: favicon,
    seed: seed,
    timestamp: getTimestamp(timestamp),
  });
  const mangledHtml = await mangleCssInternal(assembled, seed.full);
  const optimized = minifyHtmlInternal(
    mangledHtml.processed,
  );
  const actual = getHashString(await hash(optimized));
  assertEquals(actual, expected);
  console.log('favicon', mangledFavicon.classMap);
  console.log('html', mangledHtml.classMap);
});
