const { app, BrowserWindow, Menu, shell, BrowserView } = require('electron')
const path = require('path')

const TABS = [
  { id: 'ip', label: 'Irish Peptides', url: 'https://irishpeptides-web.vercel.app', color: '#1a1a2e' },
  { id: 'jarvis', label: 'Greyhound Jarvis', url: 'https://jarvis-web-three-sage.vercel.app', color: '#004225' },
]

const TAB_BAR_HEIGHT = 44

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'Jarvis Command Centre',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#111111',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: false,
  })

  win.maximize()

  // Tab state
  let activeTab = 0
  const views = []

  // Inject tab bar HTML into the main window
  win.loadURL(`data:text/html,
<!DOCTYPE html>
<html style="margin:0;padding:0;background:#0a0a0a;height:100%;overflow:hidden">
<head><meta charset="utf-8"><style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { height: 100vh; display: flex; flex-direction: column; background: #0a0a0a; font-family: -apple-system, 'Inter', sans-serif; }
#tabbar {
  height: ${TAB_BAR_HEIGHT}px; flex-shrink: 0; display: flex; align-items: center;
  background: #0d0d0d; border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 16px; gap: 4px; -webkit-app-region: drag;
}
.tab-spacer { flex: 1; }
.tab {
  -webkit-app-region: no-drag; display: flex; align-items: center; gap: 8px;
  padding: 7px 18px; border-radius: 8px; cursor: pointer; border: none;
  font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.04); transition: all 0.15s; white-space: nowrap;
}
.tab:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
.tab.active { color: #fff; font-weight: 600; }
.tab.active.ip { background: rgba(100,80,200,0.2); border: 1px solid rgba(100,80,200,0.3); }
.tab.active.jarvis { background: rgba(0,66,37,0.5); border: 1px solid rgba(255,205,0,0.3); color: #FFCD00; }
.tab-dot { width: 8px; height: 8px; border-radius: 50%; }
.tab-dot.ip { background: #6450c8; }
.tab-dot.jarvis { background: #FFCD00; }
</style></head>
<body>
<div id="tabbar">
  <button class="tab ip active" id="btn-ip" onclick="switchTab('ip')">
    <span class="tab-dot ip"></span>Irish Peptides
  </button>
  <button class="tab jarvis" id="btn-jarvis" onclick="switchTab('jarvis')">
    <span class="tab-dot jarvis"></span>Greyhound Jarvis
  </button>
  <div class="tab-spacer"></div>
</div>
</body>
<script>
function switchTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('btn-' + id).classList.add('active');
  window._switchTab && window._switchTab(id);
}
</script>
</html>`)

  // Create BrowserViews for each tab
  TABS.forEach((tab, i) => {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: `persist:${tab.id}`,
      },
    })
    win.addBrowserView(view)
    view.webContents.loadURL(tab.url)
    view.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })
    views.push(view)

    // Initially hide all except first
    if (i !== 0) {
      view.setBounds({ x: 0, y: -10000, width: 1, height: 1 })
    }
  })

  function updateViewBounds() {
    const [w, h] = win.getContentSize()
    views.forEach((view, i) => {
      if (i === activeTab) {
        view.setBounds({ x: 0, y: TAB_BAR_HEIGHT, width: w, height: h - TAB_BAR_HEIGHT })
        view.setAutoResize({ width: true, height: true })
        win.setTopBrowserView(view)
      } else {
        view.setBounds({ x: 0, y: -10000, width: 1, height: 1 })
      }
    })
  }

  win.on('resize', updateViewBounds)
  updateViewBounds()

  // Listen for tab switch from renderer (inject IPC via executeJavaScript)
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      window._switchTab = function(id) {
        const ipcRenderer = window.__ipc;
        // Use postMessage to communicate
        window.__tabSwitch = id;
      };
    `)

    // Poll for tab switch requests
    setInterval(() => {
      win.webContents.executeJavaScript('window.__tabSwitch || null').then((tabId) => {
        if (!tabId) return
        win.webContents.executeJavaScript('window.__tabSwitch = null')
        const idx = TABS.findIndex((t) => t.id === tabId)
        if (idx !== -1 && idx !== activeTab) {
          activeTab = idx
          updateViewBounds()
        }
      }).catch(() => {})
    }, 100)
  })

  // Build menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'Jarvis',
      submenu: [
        { label: 'Irish Peptides Tab', click: () => { activeTab = 0; updateViewBounds() } },
        { label: 'Greyhound Jarvis Tab', click: () => { activeTab = 1; updateViewBounds() } },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload', accelerator: 'CmdOrCtrl+R',
          click: () => views[activeTab]?.webContents.reload(),
        },
        {
          label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R',
          click: () => views[activeTab]?.webContents.reloadIgnoringCache(),
        },
        { type: 'separator' },
        {
          label: 'DevTools', accelerator: 'CmdOrCtrl+Shift+I',
          click: () => views[activeTab]?.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Irish Peptides',
      submenu: [
        { label: 'Home', click: () => views[0]?.webContents.loadURL(TABS[0].url) },
        { label: 'AI Chat', click: () => views[0]?.webContents.loadURL(TABS[0].url + '/chat') },
        { label: 'Analytics', click: () => views[0]?.webContents.loadURL(TABS[0].url + '/analytics') },
        { label: 'Agent Network', click: () => views[0]?.webContents.loadURL(TABS[0].url + '/agents') },
      ],
    },
    {
      label: 'Jarvis / Greyhound',
      submenu: [
        { label: 'Home', click: () => views[1]?.webContents.loadURL(TABS[1].url + '/home') },
        { label: 'AI Chat', click: () => views[1]?.webContents.loadURL(TABS[1].url + '/chat') },
        { label: 'Aged Debt', click: () => views[1]?.webContents.loadURL(TABS[1].url + '/aged-debt') },
        { label: 'Agent Network', click: () => views[1]?.webContents.loadURL(TABS[1].url + '/agents') },
        { label: 'System Health', click: () => views[1]?.webContents.loadURL(TABS[1].url + '/health') },
      ],
    },
    {
      label: 'Open',
      submenu: [
        { label: 'Open Current Tab in Browser', click: () => shell.openExternal(views[activeTab]?.webContents.getURL() ?? '') },
        { label: 'Irish Peptides Site', click: () => shell.openExternal('https://irishpeptides.ie') },
        { label: 'Jarvis Web (Vercel)', click: () => shell.openExternal('https://jarvis-web-three-sage.vercel.app') },
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
