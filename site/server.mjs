import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);

class StaticServer {
  constructor(dir) {
    this.dir = dir;
  }

  listen(port) {
    createServer((request, response) => this.handle(request, response))
      .listen(port, () => {
        console.log(`Serving ${this.dir}`);
        console.log(`http://localhost:${port}`);
      });
  }

  async handle(request, response) {
    const file = this.fileFor(request.url);

    try {
      const info = await stat(file);
      if (!info.isFile()) throw new Error('Not found');
      response.writeHead(200, { 'Content-Type': typeFor(file) });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  }

  fileFor(url = '/') {
    const clean = decodeURIComponent(url.split('?')[0]);
    const relative = clean.endsWith('/') ? `${clean}index.html` : clean;
    const file = path.normalize(path.join(this.dir, relative));
    if (!file.startsWith(this.dir)) return path.join(this.dir, '404');
    return file;
  }
}

function typeFor(file) {
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[path.extname(file)] || 'application/octet-stream';
}

new StaticServer(dist).listen(port);
