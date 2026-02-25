#!/bin/bash

# Script to update config.js with the current tunnel URL if it has changed
# Only commits and pushes if the URL has actually changed

set -e  # Exit on any error

LOCKFILE="/tmp/update-url.lock"
LOGFILE="/tmp/update-url.log"

# Acquire lock to prevent race conditions
exec 200>"$LOCKFILE"
if ! flock -n 200; then
    echo "$(date): Another instance is already running, exiting." >> "$LOGFILE"
    exit 0
fi

# Function to log messages
log_message() {
    echo "$(date): $1" >> "$LOGFILE"
    echo "$1"
}

log_message "Starting URL update check..."

# Check if the tunnel URL file exists
if [ ! -f "/tmp/current_tunnel_url.txt" ]; then
    log_message "Error: /tmp/current_tunnel_url.txt does not exist"
    exit 1
fi

# Read the current tunnel URL
CURRENT_URL=$(cat /tmp/current_tunnel_url.txt | tr -d '\n\r')

if [ -z "$CURRENT_URL" ]; then
    log_message "Error: Current URL is empty"
    exit 1
fi

# Validate that the URL matches the expected pattern
if [[ ! $CURRENT_URL =~ ^https://[a-zA-Z0-9.-]*\.trycloudflare\.com$ ]]; then
    log_message "Error: Invalid URL format: $CURRENT_URL"
    exit 1
fi

log_message "Current tunnel URL: $CURRENT_URL"

# Define the path to the config file (assuming we're in the repo root)
CONFIG_FILE="js/config.js"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    log_message "Error: Config file $CONFIG_FILE does not exist"
    exit 1
fi

# Extract the current URL from the config file
CURRENT_CONFIG_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$CONFIG_FILE" 2>/dev/null || echo "")

log_message "Current config URL: $CURRENT_CONFIG_URL"

# Compare URLs
if [ "$CURRENT_URL" = "$CURRENT_CONFIG_URL" ]; then
    log_message "URLs are identical, no update needed"
    exit 0
fi

log_message "URL has changed, updating config file..."

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create the new config.js content
cat > "$CONFIG_FILE" << EOF
window.APP_CONFIG = {
    API_URL: "$CURRENT_URL",
    LAST_UPDATE: "$TIMESTAMP"
};
EOF

log_message "Config file updated with new URL"

# Check if git is available
if ! command -v git &> /dev/null; then
    log_message "Error: git is not installed"
    exit 1
fi

# Change to the directory containing the script (repo root)
cd "$(dirname "$0")"

# Pull latest changes to avoid conflicts
log_message "Pulling latest changes..."
git pull --rebase || {
    log_message "Warning: git pull failed, continuing anyway"
}

# Add the config file
git add "$CONFIG_FILE"

# Check if there are any changes to commit
if git diff --cached --quiet; then
    log_message "No changes to commit after all"
    exit 0
fi

# Commit with the new URL in the commit message
COMMIT_MSG="Update tunnel URL to $CURRENT_URL [skip ci]"
git commit -m "$COMMIT_MSG"

log_message "Changes committed"

# Push to remote
git push origin main

log_message "Changes pushed successfully"

# Release the lock
exec 200>&-
rm -f "$LOCKFILE"