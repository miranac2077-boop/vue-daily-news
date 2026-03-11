#!/bin/bash
# Wrapper script for cron: load env and run sync-news.mjs
# Cron doesn't load .zshrc, so we set required env vars here

# VERCEL_TOKEN must be set in the launchd plist (EnvironmentVariables), NOT here
if [ -z "$VERCEL_TOKEN" ]; then
  echo "ERROR: VERCEL_TOKEN is not set. Configure it in the launchd plist." >&2
  exit 1
fi
export PATH="/usr/local/bin:/opt/homebrew/bin:/Users/dreambot/.nvm/versions/node/v22.22.0/bin:$PATH"

LOGFILE="/Users/dreambot/Projects/vue-daily-news/scripts/sync.log"
echo "=== $(date) ===" >> "$LOGFILE"
cd /Users/dreambot/Projects/vue-daily-news
node scripts/sync-news.mjs >> "$LOGFILE" 2>&1
echo "sync-news exit code: $?" >> "$LOGFILE"
node scripts/sync-products.mjs >> "$LOGFILE" 2>&1
echo "sync-products exit code: $?" >> "$LOGFILE"
