# irishpeptides-desktop — Disaster Recovery Guide

> Electron desktop app wrapping irishpeptides-web.vercel.app. One-page restore guide.

---

## Full restore on a new machine

### Step 1 — Prerequisites (3 min)

```powershell
winget install Git.Git
winget install OpenJS.NodeJS
```

### Step 2 — Clone repo (1 min)

```powershell
cd C:\Projects
git clone https://github.com/keithyob26/irishpeptides-desktop.git irishpeptides-desktop
cd irishpeptides-desktop
```

### Step 3 — Install dependencies (2 min)

```powershell
npm install
```

### Step 4 — Start the app

```powershell
npm start
```

The app wraps https://irishpeptides-web.vercel.app — no extra environment config needed.

### Step 5 — Rebuild installer (optional)

```powershell
npm run build
```

Produces `dist/Irish Peptides Jarvis Setup 1.0.0.exe` (or latest version).

---

## Restore from backup

1. Get `secrets.enc` from Google Drive: `Irish Peptides Backup/irishpeptides-desktop/`
2. Copy `~/.ip_jarvis_backup_key` from old machine
3. Decrypt: `py restore.py --decrypt-secrets`

Or restore full project:

```powershell
py restore.py --from-drive   # download from Drive then restore
py restore.py --from-zip PATH
```

---

## Download installer from Drive

Latest installer is at:

```
Google Drive → Irish Peptides Backup → irishpeptides-desktop → releases → IrishPeptidesJarvis-Setup-YYYYMMDD_HHMMSS.exe
```

---

## Re-authenticate Google Drive (if token expired)

```powershell
py -3.14 backup.py --auth-drive
```

---

## Backup locations

| Item | Location |
|------|----------|
| Code | Google Drive: `Irish Peptides Backup/irishpeptides-desktop/project_backup.zip` |
| Installer | Google Drive: `Irish Peptides Backup/irishpeptides-desktop/releases/IrishPeptidesJarvis-Setup-*.exe` |
| Secrets | Google Drive: `Irish Peptides Backup/irishpeptides-desktop/secrets.enc` |
| Status | GitHub: `keithyob26/irishpeptides-jarvis/memory/backup_status.json` |

---

## Repo links

- Code: https://github.com/keithyob26/irishpeptides-desktop
- Live app URL: https://irishpeptides-web.vercel.app

---

*Updated: 2026-06-15 | Irish Peptides Jarvis v2*
