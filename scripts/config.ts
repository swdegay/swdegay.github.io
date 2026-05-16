import { Context, Pipeline } from '@/scripts/types.ts';
import mangleCss from '@/plugins/css-mangle-plugin.ts';
import optimizeSvg from '@/plugins/svg-optimize-plugin.ts';
import minifyHtml from '@/plugins/html-minify-plugin.ts';
import renderTemplate from '@/plugins/template-render-plugin.ts';
import writeFile from '@/plugins/file-writer-plugin.ts';
import mergeData from '@/plugins/data-merge-plugin.ts';
import createTimestamp from '@/plugins/timestamp-create-plugin.ts';
import commitHashEnv from '@/plugins/commit-hash-plugin.ts';
import readFile from '@/plugins/file-reader-plugin.ts';

export const optimizeFavicon: Pipeline = {
  name: 'Optimized Favicon',
  key: 'favicon',
  plugins: [
    readFile('./src/favicon.svg'),
    commitHashEnv,
    mangleCss,
    optimizeSvg,
  ],
};

export function buildRaw(useDebug: boolean): Pipeline {
  return {
    name: 'Raw Build',
    key: 'raw',
    plugins: [
      commitHashEnv,
      mergeData,
      createTimestamp(useDebug),
      renderTemplate,
      mangleCss,
      writeFile('./dist/index.html'),
    ],
  };
}

export const optimizeRaw: Pipeline = {
  name: 'Optimized Build',
  key: 'optimized',
  plugins: [minifyHtml, writeFile('./dist/index.min.html')],
};

/*
 * A pipeline must take an input and produce an output.
 * When input is not from a file, it has to be taken from
 * the result of the previous pipeline.
 */
export function contextProvider(key: string, result: string): Context {
  switch (key) {
    case 'favicon':
      return { value: '', store: { favicon: result } };
    case 'raw':
      return { value: result, store: {} };
    case 'optimized':
      return { value: '', store: {} };
    case 'init':
      return { value: '', store: {} };
    default:
      throw Error('unrecognized pipeline key');
  }
}
