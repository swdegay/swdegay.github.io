import { Context, Plugin } from '@/scripts/types.ts';

const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';
const BODY_TAG_REGEX = /<\/body>/i;

export function injectUmamiScript(
  html: string,
  umamiWebsiteId: string,
): string {
  const umamiScript =
    `<script defer src="${UMAMI_SCRIPT_URL}" data-website-id="${umamiWebsiteId}"></script>`;

  if (BODY_TAG_REGEX.test(html)) {
    return html.replace(BODY_TAG_REGEX, (match) => `${umamiScript}${match}`);
  }

  return `${html.trim()}${umamiScript}`;
}

const injectUmami: Plugin = {
  name: 'Umami Analytics',
  transform(context: Context) {
    const updatedHtml = injectUmamiScript(
      context.value,
      context.store['umami_website_id'] as string,
    );
    return {
      value: updatedHtml,
      store: context.store,
    };
  },
};
export default injectUmami;
