import { minify } from 'html-minifier-terser';

export async function minifyHtml(htmlContent: string): Promise<string> {
  return await minify(htmlContent, {
    collapseWhitespace: true,
    minifyCSS: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    decodeEntities: true,
  });
}
