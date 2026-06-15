const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

const DASHBOARD_URL = 'https://irishpeptides-web.vercel.app'

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    title: 'Irish Peptides Jarvis',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#111111',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: false,
  })

  win.maximize()
  win.loadURL(DASHBOARD_URL)

  const menu = Menu.buildFromTemplate([
    {
      label: 'Jarvis',
      submenu: [
        { label: 'Dashboard', click: () => win.loadURL(DASHBOARD_URL) },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => win.webContents.reload() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => win.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'Toggle DevTools', accelerator: 'CmdOrCtrl+Shift+I', click: () => win.webContents.toggleDevTools() },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Home', click: () => win.loadURL(DASHBOARD_URL) },
        { label: 'AI Chat', click: () => win.loadURL(DASHBOARD_URL + '/chat') },
        { label: 'Analytics', click: () => win.loadURL(DASHBOARD_URL + '/analytics') },
        { label: 'Social Hub', click: () => win.loadURL(DASHBOARD_URL + '/social') },
        { label: 'Approvals', click: () => win.loadURL(DASHBOARD_URL + '/approvals') },
        { label: 'Content Studio', click: () => win.loadURL(DASHBOARD_URL + '/content') },
        { label: 'Agent Network', click: () => win.loadURL(DASHBOARD_URL + '/agents') },
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

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
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
