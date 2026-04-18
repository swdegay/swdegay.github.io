import { Config, optimize } from 'svgo';

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

export function optimizeSvg(svgContent: string): string {
  return optimize(svgContent, config).data;
}
