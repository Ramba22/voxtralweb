# Auto-Deploy System Installation Guide

This system automatically updates your website's API URL when Cloudflare generates a new temporary URL.

## Prerequisites

1. Install Cloudflared:
   ```bash
   # Ubuntu/Debian
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   
   # Or using package manager
   curl -fsSL https://pkg.cloudflare.com/pubkey.gpg | sudo apt-key add -
   echo 'deb https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
   sudo apt-get update && sudo apt-get install cloudflared
   ```

2. Ensure you have Node.js and Git installed:
   ```bash
   node --version
   git --version
   ```

## Setup Instructions

### 1. Clone Your Repository
```bash
cd ~
git clone <your-repo-url> voxtral-web
cd voxtral-web
```

### 2. Copy Scripts to Appropriate Location
```bash
# Create bin directory if it doesn't exist
mkdir -p ~/bin
cp ~/voxtral-web/start-tunnel.sh ~/bin/
cp ~/voxtral-web/update-url.sh ~/bin/
chmod +x ~/bin/start-tunnel.sh ~/bin/update-url.sh
```

### 3. Verify Directory Structure
Ensure your project has this structure:
```
voxtral-web/
├── public/
│   └── index.html (symlink to ../index.html)
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   └── app.js
├── index.html (main file for Vercel)
├── start-tunnel.sh
├── update-url.sh
├── cloudflared-tunnel.service
├── vercel.json
├── package.json
├── PROMPT.md
├── INSTALL.md
└── README.md
```

### 4. Configure Git Credentials
```bash
# Set up git credentials (use personal access token for GitHub)
git config --global credential.helper store
```

### 5. Set Up Cron Job
```bash
crontab -e
```

Add this line to check for URL changes every 2 minutes:
```
*/2 * * * * /home/ramba/bin/update-url.sh
```

### 6. Manual Test Run
```bash
# Test the update script manually first
~/bin/update-url.sh

# Start the tunnel in a screen/tmux session or background
screen -dmS tunnel ~/bin/start-tunnel.sh
```

## Usage

### Starting the Tunnel
```bash
# Option 1: In a screen session (recommended for manual use)
screen -S tunnel ~/bin/start-tunnel.sh

# Option 2: Using systemd service (recommended for automatic startup)
sudo cp ~/voxtral-web/cloudflared-tunnel.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-tunnel@$(whoami).service
sudo systemctl start cloudflared-tunnel@$(whoami).service

# Check service status
sudo systemctl status cloudflared-tunnel@$(whoami).service

# View service logs
sudo journalctl -u cloudflared-tunnel@$(whoami).service -f
```

### Monitoring
Check logs:
```bash
tail -f /tmp/update-url.log
```

### Stopping the Tunnel
```bash
# If using screen
screen -r tunnel  # attach to session and Ctrl+C
# Or kill the process
pkill -f cloudflared
```

## How It Works

1. `start-tunnel.sh` starts a Cloudflare tunnel to your localhost:3000
2. The generated temporary URL is saved to `/tmp/current_tunnel_url.txt`
3. Every 2 minutes, `update-url.sh` runs via cron
4. `update-url.sh` compares the current URL with the one in `js/config.js`
5. If different, it updates the config, commits, and pushes to GitHub
6. GitHub push triggers Vercel auto-deploy with the new URL

## Security Features

- Uses file locking to prevent race conditions
- Validates URL format before processing
- Only commits when URL actually changes
- Includes timestamp in config for transparency

## Troubleshooting

If you encounter permission errors:
- Make sure scripts are executable: `chmod +x script.sh`
- Check that `/tmp/` directory is writable
- Verify git credentials are properly configured

If the cron job isn't running:
- Check crontab syntax: `crontab -l`
- Verify the script path is absolute
- Check logs: `tail -f /tmp/update-url.log`

If using systemd service:
- Check service status: `sudo systemctl status cloudflared-tunnel@$(whoami).service`
- View logs: `sudo journalctl -u cloudflared-tunnel@$(whoami).service -f`
- Restart service: `sudo systemctl restart cloudflared-tunnel@$(whoami).service`