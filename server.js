const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4174);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json; charset=utf-8",
};

http
  .createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const relative = decodeURIComponent(url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    const fullPath = path.resolve(root, relative);
    if (!fullPath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(fullPath, (error, content) => {
      if (error) {
        fs.readFile(path.join(root, "index.html"), (_, fallback) => {
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          response.end(fallback);
        });
        return;
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(fullPath)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(content);
    });
  })
  .listen(port, () => console.log(`CAP DAEU: http://localhost:${port}`));
