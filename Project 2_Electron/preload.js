/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {

  getNotes: () => ipcRenderer.invoke('get-notes'),

  getServices: () => ipcRenderer.invoke('get-services'),

  getOrders: () => ipcRenderer.invoke('get-orders'),

  notesLogin: (data) => ipcRenderer.invoke('notes-login', data),

  saveNote: (data) => ipcRenderer.invoke('save-note', data),

  editOrder: (data) => ipcRenderer.invoke('edit-order', data),

  logout: () => ipcRenderer.invoke('logout'),

  delNote: (data) => ipcRenderer.invoke('del-note', data),

  createOrder: (data) => ipcRenderer.invoke('create-order', data)
  

})