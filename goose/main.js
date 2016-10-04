const electron = require('electron')
const {app, BrowserWindow, globalShortcut, nativeImage, ipcMain} = electron
const fs = require('fs')


function getUserShell() {
    let txt = fs.readFileSync('/etc/passwd', 'utf-8')
    let matcher = new RegExp(`.*:.*:${process.geteuid()}:.*:.*:.*:(.*)`)
    return matcher.exec(txt)[1]
}


class HidableWindow {
    constructor () {
        this.app = this.createApp()
        this.window = null
    }

    createApp() {
        app.on('ready', ()=>this.createWindow())

        app.on('window-all-closed', function () {
          if (process.platform !== 'darwin') {
              console.log('shutdown')
            app.quit()
          }
        })

        app.on('activate', ()=>{
          if (mainWindow === null) {
            this.createWindow()
          }
        })
    }

    createWindow () {
        const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
        let mainWindow = new BrowserWindow({
            width: width,
            height: height/2,
            frame:false,
            transparent: true,
            x:0,
            y:0,
        })

        let icon = nativeImage.createFromPath(`${__dirname}/goose.png`)
        mainWindow.setIcon(icon)

        mainWindow.loadURL(`file://${__dirname}/index.html`)

        mainWindow.on('closed', function () {
            mainWindow = null
        })

        // mainWindow.on('blur', ()=>{
        //     this.hide()
        // })

        globalShortcut.register('CommandOrControl+`', ()=>{
            mainWindow.isVisible() ? this.hide() : this.show()
        })
        this.window = mainWindow

        this.window.webContents.on('did-finish-load', () => {
            this.startTerm()
        })
    }

    startTerm() {
        const pty = require('pty.js');

        var term = pty.spawn(getUserShell(), [], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });

        app.on('will-quit', ()=>{
            term.kill()
        })

        term.on('data', (data)=>{
            this.window.webContents.send('output', data)
        });

        ipcMain.on('input', (event, data)=>{
            term.write(data)
        })

        ipcMain.on('resize', (event, data)=>{
            term.resize(data.cols, data.rows)
        })

        this.window.webContents.send('newTerm')
    }

    show() {
        this.window.show()
        this.window.focus()
    }

    hide() {
        this.window.hide()
    }
}


mainApp = new HidableWindow()
