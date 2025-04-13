import { contextBridge, ipcRenderer  } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ipcRenderer: {
        invoke: (...args) => ipcRenderer.invoke(...args),
      }
    })    
    contextBridge.exposeInMainWorld('api', {
      ping: () => 'pong',
    });
    contextBridge.exposeInMainWorld('myAPI', {
      saveImage: (data) => ipcRenderer.invoke('save-image', data),
      fetchImages: () => ipcRenderer.invoke('fetch-images'),
      getImageDataUrl: (imagePath) => ipcRenderer.invoke('get-image-data-url', imagePath),
      deleteImage: (path) => ipcRenderer.invoke('delete-image', path),
      
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

