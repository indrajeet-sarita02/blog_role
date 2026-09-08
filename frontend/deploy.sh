#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Removing stale database (will reseed on first request)"
rm -f database.sqlite

echo "==> Installing dependencies"
npm ci || npm install

echo "==> Building for production"
npm run build

echo "==> (Re)starting via PM2"
pm2 startOrReload ecosystem.config.js --env production

echo "==> Saving PM2 process list"
pm2 save

echo "==> Done."
echo "    App:          http://localhost:3000"
echo "    PM2 logs:     pm2 logs blog-frontend"
echo "    Restart:      pm2 restart blog-frontend"
echo
echo "    Next steps on first run:"
echo "      - pm2 startup          # survive server reboot"
echo "      - sudo pm2 startup systemd -u <user> --hp /home/<user>"
echo "      - configure nginx (see blog-nginx.conf) + certbot for TLS"