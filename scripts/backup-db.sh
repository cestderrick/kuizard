#!/usr/bin/env bash
# =============================================
# V58.2 — Backup quotidien BDD Kuizard vers FTP distant
# =============================================
# Utilise : pg_dump -Fc (format custom compresse) + lftp put
# Credentials FTP dans /home/ubuntu/.kuizard-backup.env (chmod 600)
#
# Rotation :
#   - Local : 7 dumps (une semaine glissante)
#   - FTP   : 30 dumps (un mois glissant)
#
# Deploiement :
#   sudo cp scripts/backup-db.sh /usr/local/bin/kuizard-backup.sh
#   sudo chmod +x /usr/local/bin/kuizard-backup.sh
#   sudo apt install -y lftp postgresql-client
#   Puis creer /home/ubuntu/.kuizard-backup.env (voir README ci-dessous)
#   Puis cron : sudo crontab -e -u ubuntu
#     0 3 * * * /usr/local/bin/kuizard-backup.sh >> /var/log/kuizard-backup.log 2>&1

set -euo pipefail

# --- Config par defaut (override via .env) ---
LOCAL_DIR="${LOCAL_DIR:-/home/ubuntu/backups}"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"
FTP_RETENTION_DAYS="${FTP_RETENTION_DAYS:-30}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/kuizard-backups}"

# --- Charger les credentials ---
ENV_FILE="/home/ubuntu/.kuizard-backup.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "[ERR] Fichier $ENV_FILE manquant." >&2
  echo "Cree-le avec :" >&2
  echo "  DATABASE_URL=postgresql://user:pass@localhost:5432/kuizard_prod" >&2
  echo "  FTP_HOST=ftp.example.com" >&2
  echo "  FTP_USER=monuser" >&2
  echo "  FTP_PASS=monmdp" >&2
  echo "  FTP_REMOTE_DIR=/kuizard-backups   # optionnel" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

: "${DATABASE_URL:?DATABASE_URL manquant dans $ENV_FILE}"
: "${FTP_HOST:?FTP_HOST manquant dans $ENV_FILE}"
: "${FTP_USER:?FTP_USER manquant dans $ENV_FILE}"
: "${FTP_PASS:?FTP_PASS manquant dans $ENV_FILE}"

# --- Setup dossier local ---
mkdir -p "$LOCAL_DIR"

TS=$(date +%Y%m%d_%H%M%S)
FILENAME="kuizard_${TS}.dump"
LOCAL_PATH="${LOCAL_DIR}/${FILENAME}"

echo "[$(date -Iseconds)] === Backup Kuizard start ==="

# --- 1) pg_dump ---
echo "[$(date -Iseconds)] pg_dump -> $LOCAL_PATH"
pg_dump -Fc "$DATABASE_URL" > "$LOCAL_PATH"

SIZE=$(du -h "$LOCAL_PATH" | cut -f1)
echo "[$(date -Iseconds)] Dump OK ($SIZE)"

# --- 2) Upload FTP + rotation distante ---
echo "[$(date -Iseconds)] Upload FTP vers $FTP_HOST:$FTP_REMOTE_DIR/"

lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" <<LFTP_EOF
set ssl:verify-certificate no
set net:timeout 20
set net:max-retries 3
mkdir -pf "$FTP_REMOTE_DIR"
cd "$FTP_REMOTE_DIR"
put "$LOCAL_PATH" -o "$FILENAME"

# Rotation FTP : supprimer les fichiers > FTP_RETENTION_DAYS jours
# lftp n'a pas de "mtime > N days" natif -> on le fait via cls | awk
cls --sort=date -1 kuizard_*.dump > /tmp/lftp-list.txt
LFTP_EOF

# Rotation distante : trie par date dans le nom (YYYYMMDD_HHMMSS), garde les N plus recents
FTP_KEEP=$FTP_RETENTION_DAYS
lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" -e "
set ssl:verify-certificate no
cd $FTP_REMOTE_DIR
find . -name 'kuizard_*.dump' | sort | head -n -$FTP_KEEP | xargs -r -I{} rm {}
bye
" 2>/dev/null || echo "[WARN] Rotation FTP echouee (non fatale)"

# --- 3) Rotation locale ---
echo "[$(date -Iseconds)] Rotation locale > $LOCAL_RETENTION_DAYS jours"
find "$LOCAL_DIR" -name "kuizard_*.dump" -mtime +$LOCAL_RETENTION_DAYS -delete

echo "[$(date -Iseconds)] === Backup Kuizard OK ==="
