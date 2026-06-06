import PipelineRunner from '@/scripts/runner.ts';
import {
  buildRaw,
  copyFavicon,
  optimizeDarkModeIcon,
  optimizeLightModeIcon,
  optimizeRaw,
} from '@/scripts/config.ts';
import { useDebug, useOptimizations } from '@/utils/env.ts';

const runner = new PipelineRunner();
runner.use(optimizeLightModeIcon);
runner.use(optimizeDarkModeIcon);
runner.use(buildRaw(useDebug));
useOptimizations && runner.use(optimizeRaw);
runner.use(copyFavicon);

if (import.meta.main) {
  runner.run();
}
