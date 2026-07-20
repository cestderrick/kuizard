# Backup BDD Kuizard vers FTP distant

Script `scripts/backup-db.sh` — pg_dump quotidien + push FTP + rotation.

## Installation (une fois sur le VPS)

```bash
# 1) Dependances
sudo apt install -y lftp postgresql-client

# 2) Copier le script
sudo cp /var/www/kuizard/scripts/backup-db.sh /usr/local/bin/kuizard-backup.sh
sudo chmod +x /usr/local/bin/kuizard-backup.sh

# 3) Creer le fichier de credentials (JAMAIS versionne)
nano /home/ubuntu/.kuizard-backup.env
```

Colle dedans :

```env
DATABASE_URL=postgresql://kuizard:MonPasswordDb@localhost:5432/kuizard_prod
FTP_HOST=ftp.tonserveur.com
FTP_USER=tonlogin
FTP_PASS=tonmdp
FTP_REMOTE_DIR=/kuizard-backups
```

Protege-le :
```bash
chmod 600 /home/ubuntu/.kuizard-backup.env
```

## Test manuel

```bash
/usr/local/bin/kuizard-backup.sh
```

Doit finir par `=== Backup Kuizard OK ===`. Verifie sur ton FTP qu'un fichier `kuizard_YYYYMMDD_HHMMSS.dump` est bien la.

## Cron quotidien 3h du matin

```bash
sudo crontab -e -u ubuntu
```

Ajoute :

```cron
0 3 * * * /usr/local/bin/kuizard-backup.sh >> /var/log/kuizard-backup.log 2>&1
```

Assure-toi que le log est ecrivable :
```bash
sudo touch /var/log/kuizard-backup.log
sudo chown ubuntu:ubuntu /var/log/kuizard-backup.log
```

## Rotation

- **Local** (`/home/ubuntu/backups/`) : garde 7 dumps (une semaine)
- **FTP distant** : garde les 30 plus recents

## Restore un backup

Depuis n'importe quel VPS ou machine avec `pg_restore` :

```bash
# Depuis le FTP
lftp -u USER,PASS ftp.tonserveur.com -e "get /kuizard-backups/kuizard_20260720_030001.dump; bye"

# Restore (attention : ecrase la BDD actuelle)
pg_restore --clean --no-owner --role=kuizard -d kuizard_prod kuizard_20260720_030001.dump
```
