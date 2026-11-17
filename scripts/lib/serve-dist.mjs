// Serve dist/ with a tiny static server, for the scripts that drive Chrome
// over the built site. `astro preview` won't do: run non-interactively it
// detaches into a background daemon that outlives the script, and a second
// one on another port refuses to start.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/** Start the server on a free port; resolves to { base, close }. */
export async function serveDist(who) {
  if (!existsSync('dist/index.html')) {
    console.error(`${who}: no dist/; run npm run build first`);
    process.exit(2);
  }
  const server = createServer((req, res) => {
    let file = join('dist', normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!file.startsWith('dist')) file = 'dist/404.html';
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    close: () => server.close(),
  };
}
