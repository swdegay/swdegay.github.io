import PipelineRunner from '@/scripts/runner.ts';
import {
  buildRaw,
  bundleRoboFont,
  copyFavicon,
  optimizeDarkModeIcon,
  optimizeLightModeIcon,
  optimizeRaw,
} from '@/scripts/config.ts';
import { useDebug, useOptimizations } from '@/utils/env.ts';

export async function build() {
  const runner = new PipelineRunner();
  runner.use(optimizeLightModeIcon);
  runner.use(optimizeDarkModeIcon);
  runner.use(bundleRoboFont);
  runner.use(buildRaw(useDebug));
  useOptimizations && runner.use(optimizeRaw);
  runner.use(copyFavicon);
  await runner.run();
}

if (import.meta.main) {
  await build();
}
