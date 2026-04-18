import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API requests
  if (pathname === '/api/steam') {
    const steamid = parsedUrl.query.steamid;

    if (!steamid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Adj meg egy Steam ID-t!' }));
      return;
    }

    if (!STEAM_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Steam API key is not configured. Set STEAM_API_KEY environment variable.' }));
      return;
    }

    const steamApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true`;

    try {
      const response = await fetch(steamApiUrl);
      const data = await response.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch data from Steam' }));
    }
    return;
  }

  // /api/steam_all endpoint
  if (pathname === '/api/steam_all') {
    const steamid = parsedUrl.query.steamid;

    if (!steamid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Hiányzó steamid' }));
      return;
    }

    if (!STEAM_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Hiányzik a STEAM_API_KEY környezeti változó' }));
      return;
    }

    const steamApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`;

    try {
      const response = await fetch(steamApiUrl);
      const data = await response.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Nem megfelelő adatok' }));
    }
    return;
  }

  // /api/search endpoint
  if (pathname === '/api/search') {
    const query = parsedUrl.query.q;
    const apifyToken = process.env.APIFY_API;

    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Hiányzó keresési kifejezés' }));
      return;
    }

    if (!apifyToken) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Hiányzik az APIFY_API környezeti változó' }));
      return;
    }

    try {
      const searchUrl = `https://api.apify.com/v2/acts/BPhynDzjOF46b7an2/runs?token=${apifyToken}`;
      const input = {
        searchQueries: [query],
        sort: 'relevance',
        maxResultsPerSearch: 50,
        maxSearchPages: 15,
        maxRequestRetries: 5
      };

      const runResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      const runData = await runResponse.json();

      // Wait for the run to complete
      let datasetItems = [];
      if (runData.id) {
        const datasetUrl = `https://api.apify.com/v2/datasets/${runData.defaultDatasetId}/items`;
        const datasetResponse = await fetch(datasetUrl);
        datasetItems = await datasetResponse.json();
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results: datasetItems }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    // Determine MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.mjs': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`📝 Make sure STEAM_API_KEY environment variable is set`);
});
