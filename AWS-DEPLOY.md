# 🚀 AWS Deployment Guide — Crafted by Amma

You have an AWS account. Follow these steps to deploy.

---

## STEP 1: Create RDS PostgreSQL (Free Tier)

1. **AWS Console** → Search **"RDS"** → Click **"Create database"**
2. Settings:
   - Engine: **PostgreSQL** (version 16.x)
   - Templates: ✅ **Free tier**
   - DB identifier: `amma-db`
   - Master username: `ammaadmin`
   - Master password: *(choose strong, save it!)*
   - Instance: `db.t3.micro`
   - Storage: 20 GB gp2
   - Public access: **Yes**
   - Create new VPC security group: `amma-db-sg`
3. Click **"Create database"** → Wait 5 minutes
4. Once available, copy the **Endpoint** (e.g., `amma-db.xxxxx.ap-south-1.rds.amazonaws.com`)

### Create the database:
```bash
# From your local machine (install psql if needed)
psql -h YOUR_RDS_ENDPOINT -U ammaadmin -d postgres
```
```sql
CREATE DATABASE craftedbyamma;
\q
```

---

## STEP 2: Launch EC2 Instance (Free Tier)

1. **AWS Console** → Search **"EC2"** → Click **"Launch Instance"**
2. Settings:
   - Name: `crafted-by-amma`
   - AMI: **Ubuntu Server 24.04 LTS** (Free tier eligible)
   - Instance type: **t2.micro** (Free tier)
   - Key pair: Create new → Name: `amma-key` → Download `.pem` file
   - Network settings:
     - ✅ Allow SSH (22)
     - ✅ Allow HTTP (80)
     - ✅ Allow HTTPS (443)
   - Storage: 20 GB
3. Click **"Launch Instance"**

### Fix RDS Security Group:
1. Go to **RDS** → Click your database → **VPC security group**
2. Edit inbound rules → Add rule:
   - Type: PostgreSQL (5432)
   - Source: Your EC2 security group ID
3. Save

---

## STEP 3: Connect to EC2

```bash
chmod 400 amma-key.pem
ssh -i amma-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## STEP 4: Install Everything

Paste this entire block into your EC2 terminal:

```bash
# ═══ System Update ═══
sudo apt update && sudo apt upgrade -y

# ═══ Node.js 20 ═══
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ═══ PM2 + Nginx ═══
sudo npm install -g pm2
sudo apt install -y nginx certbot python3-certbot-nginx postgresql-client

# ═══ Add swap (prevents out-of-memory on t2.micro) ═══
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo "✅ All installed"
node -v
```

---

## STEP 5: Upload Project

### Option A: Git (recommended)
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/crafted-by-amma.git
cd crafted-by-amma
```

### Option B: SCP from your computer
```bash
# From your LOCAL machine:
scp -i amma-key.pem crafted-by-amma.tar.gz ubuntu@YOUR_EC2_IP:/home/ubuntu/

# Then on EC2:
cd /home/ubuntu
tar -xzf crafted-by-amma.tar.gz
cd crafted-by-amma
```

---

## STEP 6: Configure Environment

```bash
nano .env.local
```

Paste this (replace the placeholders):

```
DATABASE_URL="postgresql://ammaadmin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/craftedbyamma"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="craftedbyamma2026"
JWT_SECRET="PASTE_RANDOM_STRING"
WHATSAPP_NUMBER="917411895085"
NODE_ENV="production"
```

Generate JWT_SECRET:
```bash
openssl rand -base64 32
```
Copy the output and paste as JWT_SECRET value.

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## STEP 7: Build & Start

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Create admin user
npx tsx prisma/seed.ts

# Build production
npm run build

# Start with PM2
pm2 start npm --name "amma" -- start
pm2 save

# Auto-restart on server reboot
pm2 startup
# (Copy and run the command PM2 prints)
```

Test: `curl http://localhost:3000/api/health`
Should return: `{"status":"healthy",...}`

---

## STEP 8: Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/craftedbyamma
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Save and activate:

```bash
sudo ln -s /etc/nginx/sites-available/craftedbyamma /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 🎉 Your site is live at: `http://YOUR_EC2_PUBLIC_IP`

---

## STEP 9: Custom Domain + SSL (Optional)

If you have a domain:

1. In your domain registrar (GoDaddy/Namecheap), add an **A record**:
   - Host: `@`
   - Points to: `YOUR_EC2_PUBLIC_IP`
   - Also add: Host: `www` → same IP

2. Wait 5-10 minutes for DNS propagation

3. Update Nginx:
```bash
sudo nano /etc/nginx/sites-available/craftedbyamma
```
Change `server_name _;` to `server_name yourdomain.com www.yourdomain.com;`
```bash
sudo nginx -t && sudo systemctl reload nginx
```

4. Install SSL (free):
```bash
sudo certbot --nginx -d craftedbyamma.com -d www.craftedbyamma.com
```
Select: Redirect HTTP to HTTPS

SSL auto-renews. Your site is now `https://yourdomain.com` 🔒

---

## ✅ POST-DEPLOYMENT CHECKLIST

```
[ ] http://YOUR_IP loads the website
[ ] http://YOUR_IP/admin → login works (admin / craftedbyamma2026)
[ ] Submit a test order → appears in admin dashboard
[ ] WhatsApp links open correctly
[ ] Mobile responsive works
[ ] /api/health returns "healthy"
[ ] Images load (product photos, logo)
```

---

## 💰 FREE TIER LIMITS (12 months)

| Service | Free Limit | Your Usage | OK? |
|---------|-----------|-----------|-----|
| EC2 t2.micro | 750 hrs/month | ~720 hrs (24/7) | ✅ |
| RDS db.t3.micro | 750 hrs/month | ~720 hrs (24/7) | ✅ |
| RDS Storage | 20 GB | ~1 GB | ✅ |
| Data Transfer | 15 GB/month out | ~2-3 GB | ✅ |
| **Monthly cost** | | | **₹0** |

⚠️ **After 12 months**: ~₹600-800/month. Set up AWS billing alerts to avoid surprises.

### Set Billing Alert:
1. AWS Console → **Billing** → **Budgets** → Create budget
2. Monthly budget: $10
3. Alert at 80% ($8) → sends email

---

## 🔄 HOW TO UPDATE

Whenever you make changes:

```bash
ssh -i amma-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/crafted-by-amma
git pull                    # if using git
npm install                 # if new packages
npm run build
pm2 restart amma
```

---

## 🆘 TROUBLESHOOTING

**Site not loading?**
```bash
pm2 status                  # Check if app is running
pm2 logs amma --lines 50    # Check error logs
sudo systemctl status nginx # Check Nginx
```

**Database connection error?**
```bash
# Test connection from EC2:
psql -h YOUR_RDS_ENDPOINT -U ammaadmin -d craftedbyamma
# If fails: check RDS security group allows EC2 on port 5432
```

**Out of memory / slow?**
```bash
free -h                     # Check memory
# Swap should show 1G. If not, re-run swap commands from Step 4
```

**PM2 not starting after reboot?**
```bash
pm2 startup
# Run the command it prints
pm2 save
```

**Reset admin password?**
```bash
cd /home/ubuntu/crafted-by-amma
# Edit .env.local → change ADMIN_PASSWORD
npx tsx prisma/seed.ts
pm2 restart amma
```
