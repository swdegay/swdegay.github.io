import { Context, Plugin } from '@/scripts/types.ts';
import { encodeBase64 } from '@std/encoding/base64';

export function getFontCss(
  base64Font: string,
  fontFamily: string,
  fontWeight = 400,
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
  `.trim();
}

export default function bundleFont(
  filePath: string,
  fontFamily: string,
  fontWeight = 400,
): Plugin {
  return {
    name: 'Font Bundle',
    async transform({ store }: Context) {
      const base64Font = encodeBase64(await Deno.readFile(filePath));
      return { value: getFontCss(base64Font, fontFamily, fontWeight), store };
    },
  };
}
