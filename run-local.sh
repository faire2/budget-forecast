#!/bin/bash
# Start Vercel dev server (runs API functions locally)
echo "Starting Vercel dev server on port 3000..."
vercel dev --listen 3000 &
VERCEL_PID=$!

# Wait for Vercel to be ready
sleep 5

# Start Vite dev server
echo "Starting Vite frontend on port 5173..."
cd client
yarn dev

# Cleanup on exit
trap "kill $VERCEL_PID" EXIT
