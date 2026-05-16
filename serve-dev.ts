import { serveDir } from '@std/http/file-server';

const DIRECTORY = './dist';

Deno.serve((req) => {
  return serveDir(req, {
    fsRoot: DIRECTORY,
    quiet: false,
  });
});
