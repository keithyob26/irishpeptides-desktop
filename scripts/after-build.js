/**
 * after-build.js — electron-builder afterAllArtifactBuild hook
 *
 * Runs after every successful npm run build.
 * Copies the NSIS installer to:
 *   G:\My Drive\Irish Peptides Backup\irishpeptides-desktop\releases\IrishPeptidesJarvis-Setup-YYYYMMDD_HHMMSS.exe
 *
 * Also updates backup_status.json in irishpeptides-jarvis GitHub repo.
 */

const fs   = require('fs')
const path = require('path')
const { execSync } = require('child_process')

module.exports = async function afterAllArtifactBuild(buildResult) {
  const artifacts = buildResult.artifactPaths || []

  // Find the NSIS .exe installer
  const installer = artifacts.find(p => p.endsWith('.exe') && !p.endsWith('.blockmap'))
  if (!installer) {
    console.log('[after-build] No .exe installer found — skipping Drive backup')
    return artifacts
  }

  const now     = new Date()
  const ts      = now.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15)
  const destDir = 'G:\\My Drive\\Irish Peptides Backup\\irishpeptides-desktop\\releases'
  const destFile = path.join(destDir, `IrishPeptidesJarvis-Setup-${ts}.exe`)

  // ── Copy to Google Drive for Desktop ──────────────────────────────────────
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
    fs.copyFileSync(installer, destFile)
    console.log(`[after-build] Installer copied to Drive: ${destFile}`)
  } catch (err) {
    console.warn(`[after-build] Drive copy failed (Drive for Desktop not mounted?): ${err.message}`)
  }

  // ── Also upload via Python backup.py --upload-installer ──────────────────
  try {
    const backupPy = path.join(__dirname, '..', 'backup.py')
    if (fs.existsSync(backupPy)) {
      execSync(`py -3.14 "${backupPy}" --upload-installer "${installer}"`, {
        stdio: 'inherit',
        timeout: 60000,
      })
    }
  } catch (err) {
    console.warn(`[after-build] Drive API upload failed: ${err.message}`)
  }

  // ── Update backup status via Python ───────────────────────────────────────
  try {
    const backupPy = path.join(__dirname, '..', 'backup.py')
    if (fs.existsSync(backupPy)) {
      execSync(`py -3.14 "${backupPy}"`, { stdio: 'inherit', timeout: 120000 })
    }
  } catch (err) {
    console.warn(`[after-build] Post-build backup failed: ${err.message}`)
  }

  console.log(`[after-build] Build complete. Installer: ${path.basename(installer)}`)
  return artifacts
}
