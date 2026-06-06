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

export const optimizeLightModeIcon: Pipeline = {
  name: 'Optimized Light Mode Icon',
  plugins: [
    readFile('./src/light_mode.svg'),
    optimizeSvg,
  ],
  postProcess(context: Context) {
    return {
      value: '',
      store: { ...context.store, light_mode_icon: context.value },
    };
  },
};

export const optimizeDarkModeIcon: Pipeline = {
  name: 'Optimized Dark Mode Icon',
  plugins: [
    readFile('./src/dark_mode.svg'),
    optimizeSvg,
  ],
  postProcess(context: Context) {
    return {
      value: '',
      store: { ...context.store, dark_mode_icon: context.value },
    };
  },
};

export function buildRaw(useDebug: boolean): Pipeline {
  return {
    name: 'Raw Build',
    plugins: [
      commitHashEnv,
      mergeData,
      createTimestamp(useDebug),
      renderTemplate,
      mangleCss,
      writeFile('./dist/index.html'),
    ],
    postProcess(context: Context) {
      return { value: context.value, store: {} };
    },
  };
};

export const copyFavicon: Pipeline = {
  name: 'Copy Favicon',
  plugins: [
    readFile('./src/favicon.svg'),
    writeFile('./dist/favicon.svg')
  ],
};

export const optimizeRaw: Pipeline = {
  name: 'Optimized Build',
  plugins: [minifyHtml, writeFile('./dist/index.min.html')],
};
