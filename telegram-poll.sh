#!/bin/bash
echo "🤖 Telegram bot polling started... (Ctrl+C to stop)"
while true; do
  curl -s http://localhost:3000/api/telegram/poll | jq -r 'if .processed > 0 then "📨 Processed \(.processed) messages" else empty end' 2>/dev/null
  sleep 2
done
