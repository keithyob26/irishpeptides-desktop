const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

const APP_URL = 'https://irishpeptides-web.vercel.app'

function createWindow() {
  const win = new BrowserWindow({
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

  win.maximize()
  win.loadURL(APP_URL)

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: 'Irish Peptides Jarvis',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win.webContents.reload() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => win.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'DevTools', accelerator: 'CmdOrCtrl+Shift+I', click: () => win.webContents.toggleDevTools() },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Home', click: () => win.webContents.loadURL(APP_URL) },
        { label: 'AI Chat', click: () => win.webContents.loadURL(APP_URL + '/chat') },
        { label: 'Analytics', click: () => win.webContents.loadURL(APP_URL + '/analytics') },
        { label: 'Agent Network', click: () => win.webContents.loadURL(APP_URL + '/agents') },
      ],
    },
    {
      label: 'Open',
      submenu: [
        { label: 'Open in Browser', click: () => shell.openExternal(win.webContents.getURL()) },
        { label: 'Irish Peptides Site', click: () => shell.openExternal('https://irishpeptides.ie') },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)
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
