# Aintution Prospects — DigitalOcean Deployment Guide

## Where You Left Off

You have completed:
- SSH into droplet, system packages updated
- UFW firewall configured (SSH + HTTP + HTTPS open)
- Node.js 20 installed
- PostgreSQL 15 installed, started, and enabled
- Database user `shashwat_user`, database `shashwat_db`, and `vector` extension created
- Repo cloned to `/var/www/shashwat-ai/Shashwat-AI`
- pnpm installed and `pnpm install` completed

---

## STEP 1 — Create the Environment File

```bash
cd /var/www/shashwat-ai/Shashwat-AI

sudo nano .env
```

Paste this content (replace values in `< >` with your real values):

```env
# Database
DATABASE_URL=postgresql://shashwat_user:YourStrongPassword123!@localhost:5432/shashwat_db

# API Server
NODE_ENV=production
PORT=8080
SESSION_SECRET=<generate-a-long-random-string-here>

# Clerk Auth (get these from your Clerk dashboard → API Keys)
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>

# Frontend build-time Clerk key
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>

# Frontend build settings
BASE_PATH=/
```

> **Generate SESSION_SECRET**: run this command and copy the output:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Save the file: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## STEP 2 — Load Env Vars into Shell

```bash
export $(grep -v '^#' .env | xargs)
```

Verify DATABASE_URL is set:

```bash
echo $DATABASE_URL
```

---

## STEP 3 — Create Database Tables (Drizzle Push)

This creates all tables in your PostgreSQL database:

```bash
pnpm --filter @workspace/db run push
```

You will see a list of tables being created. Type `yes` if prompted to confirm.

Tables created:
- `cards`
- `message_templates`
- `prospects`
- `message_statuses`
- `email_steps`
- `users`
- `sessions` (for auth sessions)

Verify tables were created:

```bash
sudo -u postgres psql -d shashwat_db -c "\dt"
```

---

## STEP 4 — Build the Shared Libraries

```bash
pnpm run typecheck:libs
```

This compiles all shared `lib/*` packages (db, api-spec, api-client-react, api-zod) that the app depends on.

---

## STEP 5 — Build the API Server

```bash
pnpm --filter @workspace/api-server run build
```

Output will be at: `artifacts/api-server/dist/index.mjs`

Verify it exists:

```bash
ls -la artifacts/api-server/dist/
```

---

## STEP 6 — Build the Frontend

```bash
PORT=21931 BASE_PATH=/ pnpm --filter @workspace/aintution-prospects run build
```

Output will be at: `artifacts/aintution-prospects/dist/public/`

Verify it exists:

```bash
ls -la artifacts/aintution-prospects/dist/public/
```

---

## STEP 7 — Install PM2 (Process Manager)

PM2 keeps your API server running and auto-restarts it on crashes or reboots.

```bash
sudo npm install -g pm2
```

---

## STEP 8 — Create PM2 Config File

```bash
sudo nano /var/www/shashwat-ai/Shashwat-AI/ecosystem.config.cjs
```

Paste this content:

```js
module.exports = {
  apps: [
    {
      name: "aintution-api",
      script: "node",
      args: "--enable-source-maps artifacts/api-server/dist/index.mjs",
      cwd: "/var/www/shashwat-ai/Shashwat-AI",
      env: {
        NODE_ENV: "production",
        PORT: "8080",
        DATABASE_URL: "postgresql://shashwat_user:YourStrongPassword123!@localhost:5432/shashwat_db",
        SESSION_SECRET: "<your-session-secret>",
        CLERK_SECRET_KEY: "<your-clerk-secret-key>",
        CLERK_PUBLISHABLE_KEY: "<your-clerk-publishable-key>",
      },
    },
  ],
};
```

> Replace `<your-session-secret>` and Clerk keys with your actual values.

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## STEP 9 — Start the API Server with PM2

```bash
cd /var/www/shashwat-ai/Shashwat-AI

pm2 start ecosystem.config.cjs

pm2 save

pm2 startup
```

The last command (`pm2 startup`) will print a command for you to copy and run — it looks like:

```
sudo env PATH=... pm2 startup systemd -u root --hp /root
```

Copy and run that exact command — it makes PM2 start automatically on reboot.

Check the API server is running:

```bash
pm2 status

pm2 logs aintution-api --lines 30
```

Test the API health endpoint:

```bash
curl http://localhost:8080/api/healthz
```

You should get a `200 OK` response.

---

## STEP 10 — Install and Configure Nginx

Nginx acts as the reverse proxy: it serves your static frontend files and forwards `/api/*` requests to your Node.js server.

```bash
sudo apt install -y nginx
```

Create the site config:

```bash
sudo nano /etc/nginx/sites-available/aintution
```

Paste this (replace `YOUR_DOMAIN_OR_IP` with your droplet's IP or domain):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Serve static frontend files
    root /var/www/shashwat-ai/Shashwat-AI/artifacts/aintution-prospects/dist/public;
    index index.html;

    # API — proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend — SPA fallback (all routes → index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/aintution /etc/nginx/sites-enabled/

sudo nginx -t

sudo systemctl restart nginx

sudo systemctl enable nginx
```

---

## STEP 11 — Test Everything

Open your browser and go to: `http://YOUR_DROPLET_IP`

You should see the Aintution Prospects landing page.

Test the API directly:

```bash
curl http://YOUR_DROPLET_IP/api/healthz
```

---

## STEP 12 — (Optional but Recommended) Set Up HTTPS with SSL

If you have a domain pointed at your droplet:

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will auto-configure Nginx for HTTPS and set up auto-renewal.

---

## STEP 13 — Fix File Permissions (if needed)

If Nginx returns 403 errors, fix permissions:

```bash
sudo chown -R www-data:www-data /var/www/shashwat-ai/Shashwat-AI/artifacts/aintution-prospects/dist/public

sudo chmod -R 755 /var/www/shashwat-ai
```

---

## Useful Commands After Deployment

| Task | Command |
|------|---------|
| View API server logs | `pm2 logs aintution-api` |
| Restart API server | `pm2 restart aintution-api` |
| Check PM2 status | `pm2 status` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Check Nginx errors | `sudo tail -f /var/log/nginx/error.log` |
| Check DB tables | `sudo -u postgres psql -d shashwat_db -c "\dt"` |

---

## When You Deploy Code Updates

```bash
cd /var/www/shashwat-ai/Shashwat-AI

git pull

pnpm install --network-concurrency=1 --child-concurrency=1

export $(grep -v '^#' .env | xargs)

pnpm run typecheck:libs

pnpm --filter @workspace/api-server run build

PORT=21931 BASE_PATH=/ pnpm --filter @workspace/aintution-prospects run build

pm2 restart aintution-api
```

---

## Summary of Services Running

| Service | Port | Managed By |
|---------|------|------------|
| PostgreSQL | 5432 | systemd |
| Node.js API | 8080 (internal only) | PM2 |
| Nginx (HTTP/HTTPS) | 80 / 443 | systemd |
