import { serveDir } from '@std/http/file-server';

const DIRECTORY = './dist';

const OPTIONS = {
  port: 8000,
  hostname: '127.0.0.1',
};

Deno.serve(OPTIONS, (req) => {
  return serveDir(req, {
    fsRoot: DIRECTORY,
    quiet: false,
  });
});
