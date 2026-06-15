import { Context, Plugin } from '@/scripts/types.ts';
import { encodeBase64 } from '@std/encoding/base64';

export function getFontCss(
  base64Font: string,
  fontFamily: string,
  fontWeight: number = 400,
): string {
  return `
  @font-face {
    font-family: '${fontFamily}';
    src: url('data:font/ttf;base64,${base64Font}') format('truetype');
    font-weight: ${fontWeight};
    font-style: normal;
  }
  body {
    font-family: '${fontFamily}';
  }
  `;
}

function bundleFont(
  filePath: string,
  fontFamily: string,
  fontWeight: number = 400,
): Plugin {
  return {
    name: 'Font Bundle',
    async transform(context: Context) {
      const bytes = await Deno.readFile(filePath);
      const base64Font = encodeBase64(bytes);
      const css = getFontCss(base64Font, fontFamily, fontWeight);
      return { value: css.trim(), store: context.store };
    },
  };
}
export default bundleFont;
