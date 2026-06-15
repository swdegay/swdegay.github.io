import { join } from '@std/path/join';

export const useDebug =
  Deno.env.get('COMMIT_HASH') === '610dac2fabc687ae9ea6bb65e6cd89e55350c992';

export const useOptimizations = Deno.env.get('GITHUB_ACTIONS') === 'true';

const outputDir = Deno.env.get('OUTPUT_DIR') || './dist/';

export function buildOutputPath(fileName: string): string {
  return join(Deno.cwd(), outputDir, fileName);
}
