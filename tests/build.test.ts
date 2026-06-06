import { assertEquals } from '@std/assert';
import { mangleCssInternal } from '@/plugins/css-mangle-plugin.ts';
import { minifyHtmlInternal } from '@/plugins/html-minify-plugin.ts';
import { optimizeSvgInternal } from '@/plugins/svg-optimize-plugin.ts';
import { renderInternal } from '@/plugins/template-render-plugin.ts';
import { getHashString, hash } from '@/utils/hash.ts';
import { getTimestamp } from '@/utils/time.ts';
import { umami } from '@/plugins/umami-analytics-plugin.ts';

Deno.test('should produce consistent builds with the same seed', async () => {
  const timestamp = Temporal.Instant.from('1970-01-01T00:00:00Z');
  const expected =
    '547a6ae34fc677b57a84aaafb898642e37462dcccbca2aecd60c05f4b2b5f9b9';
  const commitHash = '610dac2fabc687ae9ea6bb65e6cd89e55350c992';
  const lightModeIcon = optimizeSvgInternal(
    await Deno.readTextFile('./src/light_mode.svg'),
  );
  const darkModeIcon = optimizeSvgInternal(
    await Deno.readTextFile('./src/dark_mode.svg'),
  );
  const seed = {
    full: commitHash,
    short: commitHash.slice(0, 7),
  };
  const assembled = await renderInternal({
    ...JSON.parse(await Deno.readTextFile('./data/userdata.json')),
    seed: seed,
    timestamp: getTimestamp(timestamp),
    light_mode_icon: lightModeIcon,
    dark_mode_icon: darkModeIcon,
  });
  const mangledHtml = await mangleCssInternal(assembled, seed.full);
  const optimized = minifyHtmlInternal(
    mangledHtml.processed,
  ) + umami;
  const actual = getHashString(await hash(optimized));
  assertEquals(actual, expected);
  console.log('html', mangledHtml.classMap);
});
