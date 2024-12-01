import { useEffect, useRef} from "react"
//import { WebSocket } from "ws"

export default function Receiver(){
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect( () => {

        const socket = new WebSocket('ws://localhost:8080');
        console.log("Websocket Connected")
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
        }))};
        let pc : RTCPeerConnection | null = null;
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if(message.type === 'create_offer'){
                pc = new RTCPeerConnection();
                pc.addEventListener("track", async(event) => {
                    console.log("Ontrack called")
                    console.log(event);
                    if(videoRef.current){
                        console.log("video is playing")
                        videoRef.current.srcObject = new MediaStream([event.track]);
                        try{
                            await videoRef.current.play();
                        } catch(e){
                            console.log("Error playing video", e)
                        }
                    }
                })
                await pc.setRemoteDescription(message.sdp)
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({ type : "create_answer", sdp : pc.localDescription}));
                pc.onicecandidate = (event) => {
                    if(event.candidate){
                        socket.send(JSON.stringify({ type : "add_ice_candidate", iceCandidate : event.candidate}))
                        console.log("iceCandidateSent");
                    }
                }
            } else if(message.type === "iceCandidate"){
                await pc!.addIceCandidate(message.iceCandidate);
                console.log("Ice candidate Received")
            }
        }
    }, [])
    return(
        <>
            <div>Receiver</div>
            <video ref={videoRef} autoPlay muted></video>
        </>
    )
}