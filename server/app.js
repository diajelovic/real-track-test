'use strict';

import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { loadHeroes } from './hero';

const SERVER_PORT = 8080;
const LOCATION_INTERVAL_MS = 1000;
const KEEP_ALIVE_MS = 5000;

const heroes = loadHeroes();
const server = http.createServer(express());
const wss = new WebSocket.Server({ server });

server.listen(SERVER_PORT, () => {
    console.log(`Server started on port ${server.address().port}`);
});

wss.on('connection', ws => {
    console.log(`Received new web-socket connection`);
    ws.alive = true;

    ws.on('pong', () => {
        ws.alive = true;
    });
});

wss.on('close', () => {
    console.log(`Web-socket connection are closed`)
});

let uptime = 0;

setInterval(() => {
    uptime += LOCATION_INTERVAL_MS;

    heroes.forEach(hero => {
        const position = hero.track.position(uptime);

        const packet = {
            hero: hero.name,
            house: hero.house,
            x: position.x,
            y: position.y
        }

        wss.clients.forEach(ws => {
            ws.send(JSON.stringify(packet))
        });
    });
}, LOCATION_INTERVAL_MS);

setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.alive) {
          console.log(`Web-socket connection are terminated due keep-alive timeout`)
          return ws.terminate();
        }
        
        ws.alive = false;
        ws.ping();
    });
}, KEEP_ALIVE_MS);
