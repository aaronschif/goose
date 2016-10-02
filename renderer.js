const {ipcRenderer} = require('electron')

const Terminal = require('terminal.js')

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

        this.on('input', ()=>{})
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
            this.socket.emit('data', data)
        })
    }

    getTerminal() {
        if (this.terminalElem === null) {
            this.terminalElem = document.createElement('div')
            let term = document.createElement('pre')
            this.terminalElem.appendChild(term)

            term.tabindex = 0
            let terminal = new Terminal({columns: 20, rows: 2})
            let socket = this.socket

            terminal.dom(term).on('data', (data)=>{console.log(data)})
            terminal.write('asd')
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
