'use strict'

import { app, BrowserWindow, Menu, dialog } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

app.allowRendererProcessReuse = true

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMenu() {
  const template = [{
    label: 'Electron',
    submenu: [
      {
        label: 'about'
      }
    ]
  }, {
    label: 'File',
    submenu: [
      {
        label: 'Open..',
        accelerator: 'CmdOrCtrl+O', // ショートカットキーを設定
        click: () => { openFile() } // 実行される関数
      }
    ]
  }];

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu);
}

// ファイル選択ダイアログを開く
function openFile() {
  mainWindow.webContents.send('open_file');
  // dialog.showOpenDialog({ properties: ['openFile'] }, (filePath) => {

  //   console.log('openFile', filePath);
  //   // レンダラープロセスにイベントを飛ばす
  //   mainWindow.webContents.send('open_file', filePath);
  // })
}

function createMainWindow() {
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 1280,
    height: 1024,
    useContentSize: true
  })

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
  createMenu();
})
