const {ipcRenderer} = require('electron')

// const Terminal = require('terminal.js')
const Terminal = require('xterm')
require('xterm/addons/fit')

const {Duplex} = require('stream')
const EventEmitter = require('events')


// class GooseSocket extends Duplex {
//     constructor() {
//         super({
//             // objectMode: true,
//             // highWaterMark: 0,
//         })
//         // this.buffer = []
//     }
//     _write(chunk, encoding, callback) {
//         console.log('_write')
//         console.log(chunk)
//         callback()
//     }
//     _writev(chunks, callback) {
//         console.log('_writev')
//         console.log(chunks)
//         callback()
//     }
//     _read(size) {
//         console.log('_read')
//         console.log(size)
//
//         this.push(Buffer.from('asdf'))
//         // this.push()
//         // while () {
//         //     console.log('asdf')
//         // }
//         this.push(null)
//         // this.push('')
//     }
// }


class GooseSocket extends EventEmitter {
    constructor() {
        super()

        this.on('input', (data)=>{
            ipcRenderer.send('input', data)
        })
        this.on('output', ()=>{})
    }
}


class GooseChannel extends EventEmitter {
    constructor() {
        super()
        ipcRenderer.on('goose', (event, data)=>{
            this.emit('newData', data)
        })
    }
}


class GooseTerminal {
    constructor() {
        this.tabElem = null
        this.terminalElem = null
        this.socket = new GooseSocket()
        this.channel = new GooseChannel()
        this.channel.on('newData', (data)=>{
            this.socket.emit('output', data)
        })
    }

    getTerminal() {
        if (this.terminalElem === null) {
            this.terminalElem = document.createElement('div')
            let term = new Terminal()
            term.open(this.terminalElem)
            term.resize(80, 30);
            // term.fit()

            term.on('data', (data)=>{this.socket.emit('input', data)})
            term.on('title', (title)=>{this.tabElem.innerHTML = title})
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
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    let win = new GooseWindow()
    win.add()
})
