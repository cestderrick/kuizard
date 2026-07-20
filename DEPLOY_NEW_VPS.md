# Installation Kuizard sur nouveau VPS Ubuntu

Guide complet, à suivre dans l'ordre. Testé sur Ubuntu 22.04 / 24.04 LTS.

---

## 0. Prérequis

- VPS Ubuntu 22.04+ (2 vCPU / 4 Go RAM recommandés)
- Accès root ou sudo
- Un domaine (ex: kuizard.com) avec DNS A pointant sur l'IP du VPS
- Ces secrets sous la main : `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `GROQ_API_KEY`

---

## 1. Setup base système

```bash
# Connexion root, création d'un user non-root
adduser kuizard
usermod -aG sudo kuizard
su - kuizard

# Update
sudo apt update && sudo apt upgrade -y

# Outils de base
sudo apt install -y git curl wget build-essential ufw fail2ban
```

---

## 2. Firewall UFW + Fail2ban

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 3. Node.js via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

nvm install 22
nvm alias default 22
node -v   # v22.x
npm -v
```

---

## 4. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Création du user + DB
sudo -u postgres psql <<'SQL'
CREATE USER kuizard WITH PASSWORD 'CHANGE_MOI_MOT_DE_PASSE_FORT';
CREATE DATABASE kuizard_prod OWNER kuizard;
GRANT ALL PRIVILEGES ON DATABASE kuizard_prod TO kuizard;
\c kuizard_prod
GRANT ALL ON SCHEMA public TO kuizard;
SQL
```

Ton `DATABASE_URL` sera : `postgresql://kuizard:CHANGE_MOI_MOT_DE_PASSE_FORT@localhost:5432/kuizard_prod`

---

## 5. Clone du repo

```bash
sudo mkdir -p /var/www
sudo chown kuizard:kuizard /var/www
cd /var/www
git clone https://github.com/TON_ORGA/kuizard.git
cd kuizard
```

Si le repo est privé, configure une clé SSH ou utilise un Personal Access Token.

---

## 6. Fichier .env

```bash
cd /var/www/kuizard
nano .env
```

Colle et remplis :

```env
# --- Auth.js ---
AUTH_SECRET=CHANGE_ME_generate_with__openssl_rand_base64_32
AUTH_URL=https://kuizard.com
NEXTAUTH_URL=https://kuizard.com

# --- DB ---
DATABASE_URL=postgresql://kuizard:CHANGE_MOI_MOT_DE_PASSE_FORT@localhost:5432/kuizard_prod

# --- Public ---
NEXT_PUBLIC_APP_URL=https://kuizard.com

# --- Stripe ---
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_live_...

# --- Email (Resend) ---
RESEND_API_KEY=re_...
RESEND_FROM=Kuizard <no-reply@kuizard.com>

# --- IA (Groq, gratuit) ---
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# --- Env ---
NODE_ENV=production
PORT=3002
```

Génère `AUTH_SECRET` :
```bash
openssl rand -base64 32
```

Puis :
```bash
chmod 600 .env
```

---

## 7. Install deps + Prisma + Build

```bash
cd /var/www/kuizard
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

Test rapide :
```bash
npm start &
curl -I http://localhost:3002
# Doit renvoyer HTTP 200 ou 307
kill %1
```

---

## 8. PM2 (démon Node)

```bash
npm install -g pm2

cd /var/www/kuizard
pm2 start npm --name kuizard-app -- start
pm2 save
pm2 startup     # copie/colle la commande qu'il te propose (sudo env PATH=...)
```

Vérif :
```bash
pm2 status
pm2 logs kuizard-app --lines 30
```

---

## 9. Nginx reverse proxy

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/kuizard
```

Colle :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kuizard.com www.kuizard.com;

    # Redirection HTTPS géré par Certbot après SSL

    # Upload max 20 MB (couvre les images de couverture)
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }
}
```

Active + reload :
```bash
sudo ln -s /etc/nginx/sites-available/kuizard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. SSL Let's Encrypt (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kuizard.com -d www.kuizard.com
# Choisis "2. Redirect" pour forcer HTTPS
```

Auto-renouvellement (déjà en cron) : vérifie avec
```bash
sudo systemctl status certbot.timer
```

---

## 11. Storage / uploads

Kuizard écrit dans `./storage` pour les images uploadées :
```bash
cd /var/www/kuizard
mkdir -p storage
chmod 755 storage
```

Assure-toi qu'il n'est pas versionné (`.gitignore` doit déjà l'ignorer).

**Backup storage** : rsync vers un autre disque ou S3.

---

## 12. Backup PostgreSQL quotidien

```bash
mkdir -p /home/kuizard/backups
sudo nano /etc/cron.d/kuizard-backup
```

Colle :

```cron
0 3 * * * kuizard pg_dump -Fc kuizard_prod > /home/kuizard/backups/kuizard_$(date +\%Y\%m\%d).dump && find /home/kuizard/backups -mtime +14 -delete
```

Sauve les dumps aussi en offsite (rsync vers autre VPS, S3, Backblaze B2, etc.).

---

## 13. Créer le premier compte admin

Inscris-toi normalement sur `https://kuizard.com/signup`, puis :

```bash
sudo -u postgres psql kuizard_prod <<'SQL'
UPDATE "User" SET role = 'ADMIN' WHERE email = 'ghironzicedric@gmail.com';
SQL
```

Reconnecte-toi, tu auras accès à `/admin/*`.

---

## 14. Webhook Stripe

Dans le dashboard Stripe → Developers → Webhooks → Add endpoint :
- URL : `https://kuizard.com/api/stripe/webhook`
- Events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Copie le **Signing secret** → mets-le dans `.env` comme `STRIPE_WEBHOOK_SECRET`
- Restart : `pm2 restart kuizard-app`

---

## 15. DNS domaine

Chez ton registrar (OVH, Cloudflare, Gandi...) :
```
A     @      IP_DU_VPS
A     www    IP_DU_VPS
```
Propagation : quelques minutes à 24 h. Vérifie avec `dig kuizard.com`.

---

## 16. Cycle de déploiement classique (une fois installé)

```bash
cd /var/www/kuizard
git pull
npm install                    # si package.json a changé
npx prisma migrate deploy      # si nouvelle migration
npx prisma generate            # regen client TS
npm run build
pm2 restart kuizard-app
pm2 logs kuizard-app --lines 20
```

---

## 17. Checklist post-install

- [ ] `curl -I https://kuizard.com` → HTTP 200
- [ ] Inscription fonctionne + email de bienvenue reçu
- [ ] Création d'un quiz + partage QR
- [ ] Checkout Stripe test (mode test d'abord)
- [ ] `pm2 status` → app "online"
- [ ] `sudo systemctl status nginx postgresql fail2ban ufw`
- [ ] Certif SSL valide (cadenas navigateur)
- [ ] Backup pg dumped dans `/home/kuizard/backups/` (attendre 24 h ou lancer manuellement)

---

## 18. Migration depuis l'ancien VPS

Si tu changes de serveur :

**Sur l'ancien VPS :**
```bash
pg_dump -Fc kuizard_prod > kuizard_migration.dump
tar czf storage_backup.tgz /var/www/kuizard/storage
scp kuizard_migration.dump storage_backup.tgz kuizard@NOUVEAU_VPS_IP:~/
```

**Sur le nouveau VPS (après étape 4 mais avant étape 7) :**
```bash
# Restore DB
sudo -u postgres pg_restore --clean --no-owner --role=kuizard -d kuizard_prod ~/kuizard_migration.dump

# Restore storage
cd /var/www/kuizard
tar xzf ~/storage_backup.tgz --strip-components=3
```

Puis continue à l'étape 7.

---

## 19. Troubleshooting

| Symptôme | Fix |
|---|---|
| `giftDurationDays does not exist on type` | `rm -rf node_modules/.prisma && npx prisma generate` |
| Build OOM | `NODE_OPTIONS="--max-old-space-size=2048" npm run build` |
| 502 Bad Gateway Nginx | `pm2 restart kuizard-app` + `pm2 logs` pour voir l'erreur Node |
| Prisma migration bloquée | `npx prisma migrate resolve --applied NOM_DE_LA_MIGRATION` |
| Certbot renew fail | Vérifier que port 80 est ouvert (`sudo ufw status`) |
| Emails pas envoyés | Check clé Resend + domaine vérifié dans dashboard Resend |
