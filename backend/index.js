import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const httpServer = app.listen(3000, () => {
    console.log("Server started on port 3000");
});

const wss = new WebSocketServer({ server: httpServer });

let waitingUser = null;

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        if (message.type === 'start') {
            if (waitingUser) {
                ws.peer = waitingUser;
                waitingUser.peer = ws;

                waitingUser.send(JSON.stringify({ type: 'start-call' }));
                waitingUser = null;
            } else {
                // No one waiting, add to queue
                waitingUser = ws;
            }
        } else if (message.type === 'offer') {
            if (ws.peer) {
                ws.peer.send(JSON.stringify({ type: 'offer', offer: message.offer }));
            }
        } else if (message.type === 'answer') {
            if (ws.peer) {
                ws.peer.send(JSON.stringify({ type: 'answer', answer: message.answer }));
            }
        } else if (message.type === 'ice-candidate') {
            if (ws.peer) {
                ws.peer.send(JSON.stringify({ type: 'ice-candidate', candidate: message.candidate }));
            }
        }
    });

    ws.on('close', () => {
        if (waitingUser === ws) {
            waitingUser = null;
        }
        if (ws.peer) {
            ws.peer.peer = null;
            ws.peer = null;
        }
    });
});