export interface Context {
  value: string;
  store: Record<string, unknown>;
}

export interface Plugin {
  readonly name: string;
  transform: (context: Context) => Context | Promise<Context>;
}

export interface Pipeline {
  readonly name: string;
  plugins: Plugin[];
  postProcess?: (context: Context) => Context;
}
