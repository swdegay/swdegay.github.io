import { Eta } from '@bgub/eta';

export function render<T extends object>(
  data: T,
  templateDir: string = `${Deno.cwd()}/src/`,
  template: string = 'index',
): string {
  const eta = new Eta({
    views: templateDir,
    tags: ['{{', '}}'],
    varName: 'data',
    parse: { exec: '$', interpolate: '', raw: '~' },
  });
  return eta.render(template, data);
}
