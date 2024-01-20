// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fetch = require('electron-fetch').default

// "localStorage" for electron
// https://www.npmjs.com/package/electron-store
const Store = require('electron-store')
const store = new Store()

// Move this to .env (or similar...)
const API_URL = "https://flask-test-kanjikar.rahtiapp.fi"

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 920,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: false // true to hide, press Alt to show when hidden
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open DevTools automatically (comment out if you don't want it)
  mainWindow.webContents.openDevTools()

}

// Called when Electron is ready to create browser windows.
app.whenReady().then(() => {
  createWindow()

  // Check original template for MacOS stuff!
})

const getCurrentWindow = require('electron').remote



// GÖR LOGIN
ipcMain.handle('notes-login', async (event, data) => {
  // console.log('notes-login (main)')
  try {
    const resp = await fetch(API_URL + '/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      timeout: 3000
    })
    const user = await resp.json()
    console.log("Here is user token: ")
    console.log(user.token)

    store.set('jwt', user.token)
    console.log("Here is store .get")
    console.log(store.get('jwt'))


    if (resp.status > 201) return user

    store.set('jwt', user.token)
    return false // false = login succeeded

  } catch (error) {
    console.log(error.message)
    return { 'msg': "Login failed." }
  }

})

//logout
ipcMain.handle('logout', (event, data) => {
  try {
    store.delete('jwt')
    console.log("You have succesfully logged out!")
    getCurrentWindow().reload()
    
  } catch {
    return { 'msg': "Logout failed." }
  }
})



//GET OWNED CABINS
ipcMain.handle('get-notes', async () => {
  console.log('get-notes (main)')
  try {
    const resp = await fetch(API_URL + '/cabins/owned', {
      headers: { 'Authorization': 'Bearer ' + store.get('jwt') },
      timeout: 2000
    })
    const notes = await resp.json()
    if (resp.status > 201) {
      console.log(notes)
      return false
    }
    return notes

  } catch (error) {
    console.log(error.message)
    return false
  }
})

// GET SERVICES
ipcMain.handle('get-services', async () => {
  try {
    const resp = await fetch(API_URL + '/services', {
      //headers: { 'Authorization': 'Bearer ' + store.get('jwt') },
      timeout: 2000
    })
    const services = await resp.json()
    if (resp.status > 201) {
      console.log(services)
      return false
    }
    return services

  } catch (error) {
    console.log(error.message)
    return false
  }
})

// GET Orders
ipcMain.handle('get-orders', async () => {
  try {
    const resp = await fetch(API_URL + '/orders', {
      headers: { 'Authorization': 'Bearer ' + store.get('jwt') },
      timeout: 2000
    })
    const orders = await resp.json()
    if (resp.status > 201) {
      return false
    }
    return orders

  } catch (error) {
    console.log(error.message)
    return false
  }
})


//EDITERA EN ORDER
ipcMain.handle('edit-order', async (event, data) => {
  console.log('edit-order (main)')
  try {
    const resp = await fetch(API_URL + '/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: data.date,
        id: data.id,
        location: data.location,
        service: data.service
      }),
      timeout: 3000
    })
    const patchedOrder = await resp.json()
    console.log(patchedOrder)

    if (resp.status > 201) return patchedOrder

    return false // false = login succeeded

  } catch (error) {
    console.log(error.message)
    return { 'msg': "Order change failed." }
  }

})

ipcMain.handle('save-note', async (event, data) => {
  try {
    const resp = await fetch(API_URL + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + store.get('jwt')
      },
      body: JSON.stringify({ 
        date: data.date,
        service_id: data.service_id,
        location: data.location,
        service: data.service
      }),
      timeout: 3000
    })
    const savedNote = await resp.json()
    console.log(savedNote)

    if (resp.status > 201) return false

    return savedNote

  } catch (error) {
    console.log(error.message)
    return { 'msg': "Order save failed." }
  }

})


// DELETE ORDER HANDLER
ipcMain.handle('del-note', async (event, data) => {
  try {
    const resp = await fetch(API_URL + '/orders', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + store.get('jwt')
      },
      body: JSON.stringify({ 
        id: data.id
      }),
      timeout: 3000
    })
    const deletedOrder = await resp.json()
    console.log(deletedOrder)

    if (resp.status > 201) return false

    return deletedOrder

  } catch (error) {
    console.log(error.message)
    return { 'msg': "Order delete failed." }
  }
})
/*
// Example functions for communication between main and renderer (backend/frontend)
// Node skickar kommentar till browsern (renderer.js):
ipcMain.handle('get-stuff-from-main', () => 'Stuff from main!')

// Browsern skickar kommentar till node (main.js)
ipcMain.handle('send-stuff-to-main', async (event, data) => console.log(data))

// click handler
ipcMain.handle('btn-click', async () => {
  console.log('button click received in main!')
})

*/

app.on('window-all-closed', () => {
  app.quit()
  // Check original template for MacOS stuff!
})


