import { WebSocket, WebSocketServer } from "ws";
const wss = new WebSocketServer({ port : 8080 });

let senderSocket : WebSocket | null = null;
let recieverSocket : WebSocket | null = null;
wss.on('connection', (ws) => {
    ws.on('error', console.error)
    ws.on('message', (data : any) => {
        const message = JSON.parse(data);
        switch (message.type){
            case "receiver":
                recieverSocket = ws;
                console.log("receiver set");
                break;
            case "sender":
                senderSocket = ws;
                console.log("sender Set");
                break;
            case "create_offer":
                recieverSocket?.send(JSON.stringify({ type : "create_offer", sdp : message.sdp}));
                console.log("offer recieved");
                break;
            case "create_answer":
                senderSocket?.send(JSON.stringify({type : "create_answer", sdp : message.sdp}));
                console.log("answer recieved");
                break;
            case "add_ice_candidate":
                if(ws === senderSocket){
                    recieverSocket?.send(JSON.stringify({ type : "iceCandidate", iceCandidate : message.iceCandidate}))
                } else if(ws === recieverSocket){
                    senderSocket?.send(JSON.stringify({ type : "iceCandidate", iceCandidate : message.iceCandidate}))
                }
                break;
        }
    })
})