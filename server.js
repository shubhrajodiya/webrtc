const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const cors = require('cors')
let senderStream;
let activeConnection = []
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.post("/consumer", async ({ body }, res) => {
    console.log("CONSEUMER REQUEST RECEIVED")
    try {
        const peer = new webrtc.RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        // console.log(activeConnection.length)
        // if(activeConnection?.length > 5){
        //     activeConnection[0].close()
        //     activeConnection.splice(0, 1)
        // }
        // activeConnection.push(peer)
        const desc = new webrtc.RTCSessionDescription(body.sdp);
        await peer.setRemoteDescription(desc);
        senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        const payload = {
            sdp: peer.localDescription
        }
    
        res.json(payload);
    }catch{
        res.json({
            error: "No stream found"
        })
    }
    
});

app.post('/broadcast', async ({ body }, res) => {
    // console.log(body)
    console.log("RECEIVED STREAMING REQUEST")
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    console.log("ANSWER CREATED", answer)
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

function handleTrackEvent(e, peer) {
    console.log("SENDER STREAM SET")
    senderStream = e.streams[0];
};


app.listen(5000, () => console.log('server started'));