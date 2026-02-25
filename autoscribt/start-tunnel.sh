#!/bin/bash

# Script to start cloudflared tunnel and save the generated URL to a temporary file
# This script will start a trycloudflare tunnel and continuously monitor for the URL

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "Error: cloudflared is not installed. Please install cloudflared first."
    echo "Installation instructions: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    exit 1
fi

echo "Starting cloudflared tunnel..."

# Create a named pipe to capture the output
PIPE=$(mktemp -u)
mkfifo "$PIPE"

# Create a temporary file to store the output
OUTPUT_FILE=$(mktemp)

# Function to clean up on exit
cleanup() {
    rm -f "$OUTPUT_FILE"
    rm -f "$PIPE" 2>/dev/null || true
}
trap cleanup EXIT

# Start cloudflared tunnel in background, capturing output
cloudflared tunnel --url http://localhost:3000 --no-autoupdate 2>&1 > "$PIPE" &
CLOUDFLARED_PID=$!

# Function to monitor output and extract URL
monitor_output() {
    exec 3<"$PIPE"  # Open the pipe for reading
    
    while IFS= read -r line <&3; do
        echo "$line"  # Print to stdout so user can see
        
        # Look for the trycloudflare URL in the output
        if [[ $line =~ https://[a-zA-Z0-9.-]+\.trycloudflare\.com ]]; then
            url="${BASH_REMATCH[0]}"
            echo "Found tunnel URL: $url"
            
            # Save the URL to the temporary file
            echo "$url" > /tmp/current_tunnel_url.txt
            
            # Close the pipe
            exec 3<&-
            
            # Exit the function to stop monitoring
            return 0
        fi
    done
}

# Run the monitoring function
monitor_output &

# Wait for the monitoring to complete
wait $!  # Wait for the background monitoring job

echo "Tunnel started and URL saved to /tmp/current_tunnel_url.txt"

# Now wait for the cloudflared process to finish
wait $CLOUDFLARED_PID 2>/dev/null || true