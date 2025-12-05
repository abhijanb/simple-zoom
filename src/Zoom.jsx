import React, { useEffect, useState, useContext, useRef } from 'react';
import { RtcContext } from './RtcContext';

const Zoom = () => {
  const { peer } = useContext(RtcContext);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    setSocket(ws);

    ws.onopen = () => {
      setStatus('Connected to Server');
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'start-call') {
        setStatus('Call Started (Initiator)');
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: 'offer', offer }));
      } else if (message.type === 'offer') {
        setStatus('Received Offer');
        await peer.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', answer }));
      } else if (message.type === 'answer') {
        setStatus('Received Answer');
        await peer.setRemoteDescription(new RTCSessionDescription(message.answer));
      } else if (message.type === 'ice-candidate') {
        if (message.candidate) {
            try {
                await peer.addIceCandidate(new RTCIceCandidate(message.candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [peer]);

  useEffect(() => {
    setupMedia();
  }, [peer]);

  useEffect(() => {
    if (!peer || !socket) return;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };
  }, [peer, socket]);

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const handleStart = () => {
    if (socket) {
      setStatus('Waiting for peer...');
      socket.send(JSON.stringify({ type: 'start' }));
    }
  };

  return (
    <div>
      <h1>WebRTC P2P Video Call</h1>
      <p>Status: {status}</p>
      <button onClick={handleStart}>Start Call</button>
      <br /><br />
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
            <h3>Local</h3>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '300px', border: '1px solid black' }} />
        </div>
        <div>
            <h3>Remote</h3>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', border: '1px solid black' }} />
        </div>
      </div>
    </div>
  );
};

export default Zoom;
