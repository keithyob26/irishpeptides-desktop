const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')
const http = require('http')

const CLOUD_URL = 'https://irishpeptides-web.vercel.app'
const LOCAL_URL = 'http://localhost:3000'
const CHECK_INTERVAL = 30000

let mainWin = null
let isLocal = false

function checkLocal() {
  return new Promise(resolve => {
    const req = http.get(LOCAL_URL, { timeout: 2000 }, res => {
      resolve(res.statusCode < 500)
      res.destroy()
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
  })
}

function baseUrl() {
  return isLocal ? LOCAL_URL : CLOUD_URL
}

function updateTitle() {
  if (!mainWin) return
  const mode = isLocal ? 'Local' : 'Cloud'
  mainWin.setTitle(`Irish Peptides Jarvis — ${mode}`)
}

async function syncMode() {
  if (!mainWin) return
  const local = await checkLocal()
  if (local === isLocal) return
  isLocal = local
  updateTitle()
  mainWin.loadURL(baseUrl())
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'Irish Peptides Jarvis',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#0a1628',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:ip',
    },
    autoHideMenuBar: false,
  })

  mainWin.maximize()

  // Initial check then load
  checkLocal().then(local => {
    isLocal = local
    updateTitle()
    mainWin.loadURL(baseUrl())
  })

  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const navigate = route => () => mainWin.webContents.loadURL(baseUrl() + route)

  const menu = Menu.buildFromTemplate([
    {
      label: 'Irish Peptides Jarvis',
      submenu: [{ role: 'quit' }],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWin.webContents.reload() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWin.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'DevTools', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWin.webContents.toggleDevTools() },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Home', click: navigate('/') },
        { label: 'AI Chat', click: navigate('/chat') },
        { label: 'Analytics', click: navigate('/analytics') },
        { label: 'Agent Network', click: navigate('/agents') },
        { label: 'Content Studio', click: navigate('/content') },
        { label: 'System Health', click: navigate('/health') },
      ],
    },
    {
      label: 'Open',
      submenu: [
        { label: 'Open in Browser', click: () => shell.openExternal(mainWin.webContents.getURL()) },
        { label: 'Irish Peptides Site', click: () => shell.openExternal('https://irishpeptides.ie') },
        { label: 'Switch to Cloud', click: () => { isLocal = false; updateTitle(); mainWin.loadURL(CLOUD_URL) } },
        { label: 'Switch to Local', click: () => { isLocal = true; updateTitle(); mainWin.loadURL(LOCAL_URL) } },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)

  setInterval(syncMode, CHECK_INTERVAL)
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
