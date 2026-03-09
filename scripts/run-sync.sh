#!/bin/bash
# Wrapper script for cron: load env and run sync-news.mjs
# Cron doesn't load .zshrc, so we set required env vars here

export VERCEL_TOKEN="vcp_6DIJIkKgTEKWQ4Yzv1a2y6tZOMMe2xfb3mBaFr7LQuobAyY39N050yTT"
export PATH="/usr/local/bin:/opt/homebrew/bin:/Users/dreambot/.nvm/versions/node/v22.22.0/bin:$PATH"

LOGFILE="/Users/dreambot/Projects/vue-daily-news/scripts/sync.log"
echo "=== $(date) ===" >> "$LOGFILE"
cd /Users/dreambot/Projects/vue-daily-news
node scripts/sync-news.mjs >> "$LOGFILE" 2>&1
echo "sync-news exit code: $?" >> "$LOGFILE"
node scripts/sync-products.mjs >> "$LOGFILE" 2>&1
echo "sync-products exit code: $?" >> "$LOGFILE"
