# Auto-Deploy System with Cloudflare Tunnels

This system provides a fully automated solution for updating your web application's API URL when Cloudflare generates a new temporary URL.

## 🎯 Goal

Creates a completely automated system that:
- Starts a cloudflared TryCloudflare tunnel
- Automatically detects the generated temporary URL
- Updates a config.js file in a local GitHub repository
- Only commits + pushes when URL changes
- Triggers an auto-deploy on Vercel

## 🧱 Architecture

```
cloudflared (trycloudflare)
        ↓
start-tunnel.sh
        ↓
/tmp/current_tunnel_url.txt
        ↓
update-url.sh (cron every 2 minutes)
        ↓
GitHub Push
        ↓
Vercel Auto-Deploy
```

## ✅ Features

- Completely free to use
- Works without fixed domains
- No Named Tunnels required
- No Cloudflare DNS needed
- No sudo required
- Robust against duplicate commits
- Race condition protection with file locking
- Comprehensive error handling
- Automatic reconnection on failure

## 📁 Files Included

- `start-tunnel.sh` - Starts the cloudflared tunnel and extracts the URL
- `update-url.sh` - Monitors and updates config.js when URL changes
- `js/config.js` - Template configuration file
- `public/index.html` - Symlink to root index.html for local dev
- `index.html` - Main HTML file for Vercel deployment
- `css/style.css` - Styling for the web interface
- `js/app.js` - Application logic
- `cloudflared-tunnel.service` - Systemd service file for automatic startup
- `vercel.json` - Vercel deployment configuration
- `package.json` - NPM configuration for deployment
- `INSTALL.md` - Complete installation guide

## 🚀 Quick Start

See the [INSTALL.md](INSTALL.md) file for complete setup instructions.

## 🛠️ Requirements

- Linux/macOS system
- Cloudflared installed
- Git installed with proper credentials
- Node.js (if running a local server on port 3000)

## 📋 Complete Prompt

The complete requirements and prompt for this system can be found in the [PROMPT.md](PROMPT.md) file, including all implementation details and bonus features.