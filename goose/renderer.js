const {ipcRenderer} = require('electron')
const debounce = require('debounce')

const Terminal = require('xterm')
require('xterm/addons/fit')

const {Duplex} = require('stream')
const EventEmitter = require('events')

Terminal.prototype.bell = function() {
    this.emit('bell')
}

class GooseSocket extends EventEmitter {
    constructor() {
        super()

        this.on('resize', (xy)=>{
            // console.log(xy)
            ipcRenderer.send('resize', xy)
        })
        this.on('input', (data)=>{
            ipcRenderer.send('input', data)
        })
        ipcRenderer.on('output', (event, data)=>{
            this.emit('output', data)
        })
    }
}


class GooseTerminal {
    constructor() {
        this.tabElem = null
        this.terminalElem = null
        this.socket = new GooseSocket()
    }

    getTerminal() {
        if (this.terminalElem === null) {
            this.terminalElem = document.createDocumentFragment()
            let term = this.term = new Terminal()
            term.open(this.terminalElem)
            term.resize(80, 30);
            term.on('resize', (event)=>{
                this.socket.emit('resize', {cols: event.cols, rows: event.rows})
            })
            term.on('bell', ()=>{
                let a = document.createElement('audio')
                a.src = './ding.mp3'
                a.play()
            })

            term.on('data', (data)=>{this.socket.emit('input', data)})
            term.on('title', debounce((title)=>{this.tabElem.innerHTML = title}), 20)
            this.socket.on('output', (data)=>{term.write(data)})
        }
        return this.terminalElem
    }

    getTab() {
        if (this.tabElem === null) {
            this.tabElem = document.createElement('div')
            this.tabElem.className = 'tab'
            this.tabElem.innerHTML = 'placeholder'
        }
        return this.tabElem
    }
}


class GooseWindow {
    constructor() {
        let body = document.querySelector('body')
        body.addEventListener('keydown', (event)=>{
            // console.log(event.shiftKey)
            // console.log(event.ctrlKey)
            // console.log(event.key)
        })
        this.regionTabs = document.querySelector('.region-tabs')
        this.regionTerminal = document.querySelector('.region-terminal')
    }

    add() {
        let term = new GooseTerminal()
        this.regionTabs.appendChild(term.getTab())
        this.regionTerminal.appendChild(term.getTerminal())
        window.addEventListener('resize', debounce(()=>{term.term.fit()}, 200))
        term.term.fit()
        term.term.textarea.focus()
    }
}

// document.addEventListener('DOMContentLoaded', ()=>{
ipcRenderer.on('newTerm', ()=>{
    let win = new GooseWindow()
    win.add()
})
