const {ipcRenderer} = require('electron')

const Terminal = require('terminal.js')

const regionTabs = document.querySelector('.region-tabs')
const regionTerminal = document.querySelector('.region-terminal')

let terminal = new Terminal({columns: 20, rows: 2})
let termElem = document.createElement('div')


ipcRenderer.on('ping', (event, data)=>{
    console.log(data)
    console.log('asdf')
    let span = document.createElement('span')
    span.innerHTML = `${data}`

    regionTerminal.appendChild(termElem)
    terminal.dom(termElem)
    terminal.write(data)
    regionTerminal.appendChild(span)
})

ipcRenderer.send('goose-type', 'ping')

for (let i=0; i < 10; i++) {
    let span = document.createElement('span')
    span.innerHTML = "Tab #1"
    span.className = "tab"
    regionTabs.appendChild(span)
}
