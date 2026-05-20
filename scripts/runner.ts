import { Context, Pipeline } from '@/scripts/types.ts';
import log from '@/utils/log.ts';

class PipelineRunner {
  private pipelines: Pipeline[];

  constructor() {
    this.pipelines = [];
  }

  public use(pipeline: Pipeline) {
    this.pipelines.push(pipeline);
  }

  public async run() {
    if (this.pipelines.length === 0) {
      log.error('Error', 'No pipelines to run.');
      return;
    }
    let lastResult: Context = { value: '', store: {} };
    for (const pipeline of this.pipelines) {
      const result = await this.runPipeline(pipeline, lastResult);
      lastResult = pipeline.postProcess
        ? pipeline.postProcess(result)
        : { value: '', store: {} };
    }
  }

  private async runPipeline(
    pipeline: Pipeline,
    context: Context,
  ): Promise<Context> {
    const start = performance.now();
    log.hint(`🚀 ${pipeline.name}`);
    let _context = context;
    for (const plugin of pipeline.plugins) {
      log.hint(`  🔌 ${plugin.name}`);
      _context = await plugin.transform(_context);
    }
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    log.hint(`⌚ Total duration ${duration}ms\n`);
    return _context;
  }
}

export default PipelineRunner;
