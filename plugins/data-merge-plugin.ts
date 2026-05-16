import { Context, Plugin } from '@/scripts/types.ts';

async function mergeDataFolder(
  dir: string = './data',
): Promise<Record<string, unknown>> {
  const mergedData = {};

  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile && entry.name.endsWith('.json')) {
      const filePath = `${dir}/${entry.name}`;
      const content = await Deno.readTextFile(filePath);

      try {
        const json = JSON.parse(content);
        Object.assign(mergedData, json);
      } catch {
        continue;
      }
    }
  }

  return mergedData;
}

const mergeData: Plugin = {
  name: 'Merge Data Folder',
  async transform(context: Context) {
    const data = await mergeDataFolder();
    if (Object.entries(data).length === 0) {
      throw Error('no data available');
    }
    const newContext: Context = {
      value: context.value,
      store: {
        ...context.store,
        ...data,
      },
    };
    return newContext;
  },
};

export default mergeData;
