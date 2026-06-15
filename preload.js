const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('jarvis', {
  platform: process.platform,
  version: process.versions.electron,
})
