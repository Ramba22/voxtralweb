# Auto-Deploy System with Cloudflare Tunnels - Complete Prompt

## 🎯 Goal

Create a fully automated system that:

- Starts a cloudflared TryCloudflare tunnel
- Automatically detects the generated temporary URL
- Updates a config.js file in a local GitHub repository
- Only commits + pushes when URL changes
- Triggers an auto-deploy on Vercel

The system must:

- Work completely free of charge
- Operate without fixed domains
- Not require Named Tunnels
- Not use Cloudflare DNS
- Not require sudo privileges
- Be robust against duplicate commits

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

## 📁 Project Structure (local repo)

```
voxtral-web/
├── public/index.html
└── js/config.js   ← gets automatically overwritten
```

## ⚙️ Implementation Requirements

### 1️⃣ Tunnel-Start Wrapper

Create a bash script:
- Name: start-tunnel.sh
- Starts: cloudflared tunnel --url http://localhost:3000
- Parses live the generated trycloudflare URL
- Saves it in /tmp/current_tunnel_url.txt
- Uses tee or pipe processing
- No logfile parsing via journalctl
- Regex: https://[a-zA-Z0-9.-]*\.trycloudflare\.com

### 2️⃣ Update-Script

Create:
- update-url.sh
- Function:
  - Reads /tmp/current_tunnel_url.txt
  - Compares URL with current URL in js/config.js
  - If unchanged → exit immediately
  - If changed:
    - Rewrite config.js
    - git pull --rebase
    - git add config.js
    - git commit with URL in commit text
    - git push origin main
- Example config.js structure:
```javascript
window.APP_CONFIG = {
    API_URL: "https://xyz.trycloudflare.com",
    LAST_UPDATE: "YYYY-MM-DD HH:MM:SS"
};
```

### 3️⃣ Security Requirements

- No sudo usage
- Script must not crash if URL file is missing
- No commit when URL is identical
- Errors must not trigger endless commits

### 4️⃣ Automation

Cronjob:
```
*/2 * * * * /home/user/bin/update-url.sh
```

## 🧠 Technical Priorities

- Idempotency (no unnecessary commits)
- Minimalist solution
- No external dependencies
- No fixed domains
- No Named Tunnel
- 100% free

## 🎯 Expected Result

When PC reboots:
- Tunnel starts
- New trycloudflare URL generated
- update-url.sh detects change
- config.js updated
- GitHub receives commit
- Vercel deploys automatically
- Website shows new API_URL

## 🛠️ Bonus Features (Optional)

- Add flock Lockfile to prevent race conditions
- Logging for debugging
- Systemd service instead of Cron
- Generate:
  - start-tunnel.sh (ready to run)
  - update-url.sh (robust)
  - Example config.js
  - Brief installation guide

## 💡 **Tipp fürs Vibe‑Coding**
When you paste this prompt in Cursor or Windsurf, you usually get:
- A complete HTML file
- CSS for an appealing design
- Ready JavaScript functions for upload, status checking, download

Then you can test directly – and if you want changes, just say:  
*"Change the design to dark theme"* or *"Add a progress indicator"*.

If you need multiple files (`index.html`, `config.js`, `style.css`), write:  
*"Separate CSS and JavaScript into separate files."*

## 🎨 Modern Dark-Themed Web Interface Features

The resulting interface should include:
- Responsive dark-themed design
- API configuration display
- File upload functionality with drag & drop
- Progress indicators
- Status monitoring
- Auto-refresh capability
- Error handling and user feedback