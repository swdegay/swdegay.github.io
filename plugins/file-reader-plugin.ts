import { Context, Plugin } from '@/scripts/types.ts';

function readFile(inputPath: string): Plugin {
  return {
    name: 'File Reader',
    async transform(context: Context) {
      return {
        value: await Deno.readTextFile(inputPath),
        store: context.store,
      };
    },
  };
}
export default readFile;
