import PipelineRunner from '@/scripts/runner.ts';
import {
  buildRaw,
  contextProvider,
  optimizeFavicon,
  optimizeRaw,
} from '@/scripts/config.ts';
import { useDebug, useOptimizations } from '@/utils/env.ts';

const onContextRequest = (lastResult: Record<string, string>) => {
  const key = Object.keys(lastResult)[0];
  return contextProvider(key, lastResult[key]);
};

const runner = new PipelineRunner();
runner.use(optimizeFavicon);
runner.use(buildRaw(useDebug));
useOptimizations && runner.use(optimizeRaw);

if (import.meta.main) {
  runner.run(onContextRequest);
}
