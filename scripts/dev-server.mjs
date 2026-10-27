import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
const root = process.cwd(), port = Number(process.env.PORT) || 4173;
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".mjs":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json", ".webmanifest":"application/manifest+json", ".svg":"image/svg+xml", ".png":"image/png" };
http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const segment = decodeURIComponent(url.pathname);
    const full = resolve(root, "."+segment+(segment.endsWith("/")?"index.html":""));
    if (full !== root && !full.startsWith(root+sep)) { res.writeHead(403);res.end("Forbidden");return; }
    if (!(await stat(full)).isFile()) throw Error("not file");
    const contents = await readFile(full);
    res.writeHead(200, {"Content-Type":mime[extname(full)]||"application/octet-stream","Cache-Control":"no-cache","X-Content-Type-Options":"nosniff"});
    res.end(contents);
  } catch {res.writeHead(404);res.end("Not found");}
}).listen(port,"0.0.0.0",()=>console.log("My Cozy World on http://localhost:"+port));
