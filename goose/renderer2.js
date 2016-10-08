const {ipcRenderer} = require('electron')
const ipc = require('./ipc')

ipcRenderer.on('init', (event, data)=>{
    let winIPC = new ipc.Window(data.id)
    winIPC.emit('reqTerm')
})
