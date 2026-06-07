#!/bin/bash
# =============================================
# Backup Postgres Kuizard
# =============================================
# Dump compressé de la BDD avec rotation 14 jours.
# Exécuté par cron sur le VPS (voir docs/backup-setup.md).
#
# Variables d'env attendues (depuis /etc/kuizard.env ou .env loadé) :
#   POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
#   BACKUP_DIR (default: /home/ubuntu/kuizard-backups)
#   BACKUP_KEEP_DAYS (default: 14)

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/kuizard-backups}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-kuizard-postgres}"

# Vérifs essentielles
if [[ -z "${POSTGRES_USER:-}" || -z "${POSTGRES_DB:-}" ]]; then
  echo "[backup] POSTGRES_USER ou POSTGRES_DB manquant dans l'env." >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
FILENAME="${BACKUP_DIR}/kuizard-${POSTGRES_DB}-${TIMESTAMP}.sql.gz"

echo "[backup] $(date) → dump vers ${FILENAME}"

# Dump via Docker. PGPASSWORD passé dans l'env du container.
docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:-}" "${DOCKER_CONTAINER}" \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  --no-owner --no-acl --format=plain \
  | gzip -9 > "${FILENAME}"

# Vérifier que le dump n'est pas vide (au moins 1 ko, sinon problème)
SIZE=$(stat -c%s "${FILENAME}")
if [[ "${SIZE}" -lt 1024 ]]; then
  echo "[backup] ⚠ Dump suspect (${SIZE} octets). Conservé pour analyse." >&2
  exit 1
fi

echo "[backup] ✓ Dump OK (${SIZE} octets)"

# Rotation : supprime les dumps > BACKUP_KEEP_DAYS
DELETED=$(find "${BACKUP_DIR}" -name "kuizard-${POSTGRES_DB}-*.sql.gz" \
  -type f -mtime "+${BACKUP_KEEP_DAYS}" -print -delete | wc -l)
if [[ "${DELETED}" -gt 0 ]]; then
  echo "[backup] 🗑 ${DELETED} ancien(s) dump(s) supprimé(s)"
fi

# Stats finales
COUNT=$(find "${BACKUP_DIR}" -name "kuizard-${POSTGRES_DB}-*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
echo "[backup] 📦 ${COUNT} backup(s) conservé(s), ${TOTAL_SIZE} au total"
