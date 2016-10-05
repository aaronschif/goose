const {IPC} = require('node-ipc')

const appspace = 'goose.'

class Controller {
    constructor(server_id) {
        this.ipc = new IPC
        this.ipc.config.appspace = appspace
        this.ipc.config.id = 'world'

        this.ipc.serve(()=>{
            // this.ipc.on()
        })
        this.ipc.server.start()
    }
}


class Window {
    constructor(server_id, window_id) {
        this.ipc = new IPC
        this.ipc.config.appspace = appspace
        this.ipc.config.id = 'window'+window_id

        this.ipc.connectTo('world', ()=>{

        })
    }
}


class Terminal {
    constructor(server_id, terminal_id) {
        this.ipc = new IPC
        this.ipc.config.appspace = appspace
        this.ipc.config.id = 'terminal'+terminal_id
    }
}

const electron = require('electron')
const {app, BrowserWindow, globalShortcut, nativeImage, ipcMain} = electron

class GooseApp {
    constructor() {
        this.windowAllocations = 0
        this.terminalAllocations = 0
        this.windows = []
        this.initController()
        this.initApp()
    }

    initController() {
        let con = this.controller = new Controller()
        con.ipc.server.on('reqTerm', (data, socket)=>{
            con.ipc.server.emit('newTerm')
        })
    }

    initApp() {
        app.on('ready', ()=>this.newWindow())

        app.on('window-all-closed', function () {
            if (process.platform !== 'darwin') {
                console.log('shutdown')
                app.quit()
            }
        })
    }

    newWindow() {
        let win = new BrowserWindow()
        let winNum = this.windowAllocations++
        this.windows.push(win)

        win.loadURL(`file://${__dirname}/index2.html`)
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('init', {id: winNum})
        })
    }
}

module.exports.Window = Window

module.exports.startApp = ()=>{
    new GooseApp()
}
