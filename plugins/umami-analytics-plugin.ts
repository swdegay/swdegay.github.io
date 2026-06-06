import { Context, Plugin } from '@/scripts/types.ts';

export const umami =
  `<script defer src=https://cloud.umami.is/script.js data-website-id=0fd09be0-0899-4a42-8730-0621b891fdd6></script>`;

const injectUmami: Plugin = {
  name: 'Umami Analytics',
  transform(context: Context) {
    const updatedHtml = context.value + umami;
    return {
      value: updatedHtml,
      store: context.store,
    };
  },
};
export default injectUmami;
