import { Context, Plugin } from '@/scripts/types.ts';

const COMMIT_HASH_REGEX = /^[0-9a-f]{40,64}$/i;

const commitHashEnv: Plugin = {
  name: 'Commit Hash Env.',
  transform(context: Context) {
    const seed = Deno.env.get('COMMIT_HASH');
    if (seed && COMMIT_HASH_REGEX.test(seed)) {
      const short = seed.slice(0, 7);
      const newContext = {
        value: context.value,
        store: {
          ...context.store,
          seed: {
            full: seed,
            short: short,
          },
        },
      };
      return newContext;
    }
    throw Error('wrong commit hash env');
  },
};

export default commitHashEnv;
