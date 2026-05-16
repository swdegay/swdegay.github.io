import { Config, optimize } from 'svgo';
import { Context, Plugin } from '@/scripts/types.ts';

const SVG_BASE64_REGEX = /^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/;

const config: Config = {
  multipass: true,
  datauri: 'base64',
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          inlineStyles: false,
          // minifyStyles: false,
          cleanupIds: false,
        },
      },
    },
  ],
};

/** @internal */
export function optimizeSvgInternal(content: string): string {
  return optimize(content, config).data;
}

const optimizeSvg: Plugin = {
  name: 'SVG Optimizer',
  transform(context: Context) {
    const result = optimizeSvgInternal(context.value);
    if (SVG_BASE64_REGEX.test(result)) {
      const newContext = {
        value: result,
        store: context.store,
      };
      return newContext;
    }
    throw Error('invalid base64 svg');
  },
};
export default optimizeSvg;
