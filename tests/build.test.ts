import { assertEquals } from '@std/assert';
import { mangleCssInternal } from '@/plugins/css-mangle-plugin.ts';
import { minifyHtmlInternal } from '@/plugins/html-minify-plugin.ts';
import { optimizeSvgInternal } from '@/plugins/svg-optimize-plugin.ts';
import { renderInternal } from '@/plugins/template-render-plugin.ts';
import { getHashString, hash } from '@/utils/hash.ts';
import { getTimestamp } from '@/utils/time.ts';
import { injectUmamiScript } from '@/plugins/umami-analytics-plugin.ts';

Deno.test('should produce consistent builds with the same seed', async () => {
  const timestamp = Temporal.Instant.from('1970-01-01T00:00:00Z');
  const expected =
    '78228d30566eadb866cd4ab96c165ed94bb7b3908a9e9266330935bbfad8ee3f';
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
  const data = JSON.parse(await Deno.readTextFile('./data/userdata.json'));
  const assembled = await renderInternal({
    ...data,
    seed: seed,
    timestamp: getTimestamp(timestamp),
    light_mode_icon: lightModeIcon,
    dark_mode_icon: darkModeIcon,
  });
  const mangledHtml = await mangleCssInternal(assembled, seed.full);
  const optimized = minifyHtmlInternal(
    injectUmamiScript(mangledHtml.processed, data.umami_website_id),
  );

  console.log(optimized);
  const actual = getHashString(await hash(optimized));
  assertEquals(actual, expected);
  console.log('html', mangledHtml.classMap);
});
