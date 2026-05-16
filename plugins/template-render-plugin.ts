import vento from 'vento';
import { Context, Plugin } from '@/scripts/types.ts';

const env = vento({
  dataVarname: 'data',
  autoDataVarname: true,
  includes: `${Deno.cwd()}/src/`,
  autoescape: false,
});

/** @internal */
export async function renderInternal(
  data?: Record<string, unknown>,
  template: string = 'index.vto',
): Promise<string> {
  const _template = await env.load(template);
  return (await _template(data)).content;
}

const renderTemplate: Plugin = {
  name: 'Template Engine',
  async transform(context: Context) {
    context.value = await renderInternal(context.store);
    return context;
  },
};
export default renderTemplate;
