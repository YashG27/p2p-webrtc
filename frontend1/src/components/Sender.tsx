import { useEffect, useState } from "react"

export default function Sender(){

    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }))};
        setSocket(socket)
        console.log("Websocket Connected")
    }, [])

    async function StartSendingVideo(){
        if(!socket) return;
        const pc = new RTCPeerConnection();
        pc.onnegotiationneeded = async() => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({ type : "create_offer", sdp : pc.localDescription}))
        }
        pc.onicecandidate = (event) => {
            if(event.candidate){
                socket.send(JSON.stringify({ type : "add_ice_candidate", iceCandidate : event.candidate}))
                console.log("Ice candidate sent");
            }
        }
        socket.onmessage = async(event) => {
            const message = JSON.parse(event.data);
            if(message.type === "create_answer"){
                await pc.setRemoteDescription(message.sdp)
            } else if(message.type === "iceCandidate"){
                await pc.addIceCandidate(message.iceCandidate);
                console.log("Ice candidate received")
            }
        }
        const stream = await navigator.mediaDevices.getUserMedia( {video : true, audio : false});
        pc.addTrack(stream.getVideoTracks()[0], stream)
    }
    return(
        <>
            <div>Sender</div>
            <button onClick={StartSendingVideo}>Start</button>
        </>
    )
}