import PipelineRunner from '@/scripts/runner.ts';
import {
  buildRaw,
  optimizeDarkModeIcon,
  optimizeFavicon,
  optimizeLightModeIcon,
  optimizeRaw,
} from '@/scripts/config.ts';
import { useDebug, useOptimizations } from '@/utils/env.ts';

const runner = new PipelineRunner();
runner.use(optimizeLightModeIcon);
runner.use(optimizeDarkModeIcon);
runner.use(optimizeFavicon);
runner.use(buildRaw(useDebug));
useOptimizations && runner.use(optimizeRaw);

if (import.meta.main) {
  runner.run();
}
