import { atomicWrite } from '@/utils/file.ts';
import { Context, Plugin } from '@/scripts/types.ts';
import log from '@/utils/log.ts';

function writeFile(outputPath?: string): Plugin {
  return {
    name: 'File Writer',
    async transform(context: Context) {
      const path = outputPath ?? context.store.outputPath as string;
      await atomicWrite(path, context.value);
      log.success('Build', `➜ ${path}`);
      return context;
    },
  };
}

export default writeFile;
