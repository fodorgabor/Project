# Sutinek - Game Library

## Local Development Setup

### Prerequisites
- Node.js 16+ installed
- Steam API Key (get it from https://steamcommunity.com/dev/apikey)

### Setup Steps

1. **Set your Steam API Key**
   
   On Windows (Command Prompt):
   ```
   set STEAM_API_KEY=your_api_key_here
   ```
   
   On Windows (PowerShell):
   ```
   $env:STEAM_API_KEY='your_api_key_here'
   ```
   
   On macOS/Linux (Bash):
   ```
   export STEAM_API_KEY=your_api_key_here
   ```

2. **Start the dev server**
   ```
   npm run dev
   ```
   
   The server will start at `http://localhost:8080`

3. **Open in browser**
   Navigate to `http://localhost:8080` and search for games using a Steam User ID

### Features
- ✅ Local dev server with API proxy
- ✅ Vercel production deployment compatible
- ✅ Steam API integration
- ✅ Lazy loading images
- ✅ Pagination for game lists

### How It Works
- **Local Development**: `dev-server.js` runs a Node.js server that serves static files and proxies API calls to Steam
- **Production (Vercel)**: The serverless functions in `/api/` handle the API calls

### Vercel Deployment
The project is ready for Vercel deployment:
- `vercel.json` is configured for version 2
- API handlers in `/api/` are ready to use
- No changes needed to the existing Vercel setup
