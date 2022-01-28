'use strict'

import express from 'express'
import { WebSocketServer } from 'ws'
import { loadHeroes } from './hero.mjs'

const heroes = loadHeroes()
const server = express()

const SERVER_PORT = 8080
const LOCATION_INTERVAL_MS = 1000
const KEEP_ALIVE_MS = 10000
let uptime = 0

const wss = new WebSocketServer({ port: SERVER_PORT + 1 })

server.use(express.static('public'))

server.listen(SERVER_PORT, () => {
  console.log(`Server started on port ${SERVER_PORT}`)
})

wss.on('connection', ws => {
  console.log('Received new web-socket connection')
  ws.alive = true

  ws.on('pong', () => {
    ws.alive = true
  })
})

wss.on('close', () => {
  console.log('Web-socket connection are closed')
})

setInterval(() => {
  uptime += LOCATION_INTERVAL_MS

  heroes.forEach(hero => {
    const position = hero.track.position(uptime)

    const packet = {
      hero: hero.name,
      house: hero.house,
      x: position.x,
      y: position.y
    }

    wss.clients.forEach(ws => {
      ws.send(JSON.stringify(packet))
    })
  })
}, LOCATION_INTERVAL_MS)

setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.alive) {
      console.log('Web-socket connection are terminated due keep-alive timeout')
      return ws.terminate()
    }
    
    ws.alive = false
    ws.ping()
  })
}, KEEP_ALIVE_MS)
