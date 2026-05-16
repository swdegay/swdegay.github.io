import { Context, Plugin } from '@/scripts/types.ts';
import { getTimestamp } from '@/utils/time.ts';

function createTimestamp(useDebug: boolean): Plugin {
  let now;
  if (useDebug) {
    now = Temporal.Instant.from('1970-01-01T00:00:00Z');
  } else {
    now = Temporal.Now.instant();
  }
  return {
    name: 'Timestamp',
    transform(context: Context) {
      return {
        value: context.value,
        store: {
          ...context.store,
          timestamp: getTimestamp(now),
        },
      };
    },
  };
}
export default createTimestamp;
