import React from 'react';
import { RtcContext } from './RtcContext';

const Zoom = () => {
  const { peer } = React.useContext(RtcContext);
  const [remoteDescription, setRemoteDescription] = React.useState('');
  const [remoteAnswer, setRemoteAnswer] = React.useState('');
  const [localOffer, setLocalOffer] = React.useState('');
  const [localAnswer, setLocalAnswer] = React.useState('');

  React.useEffect(() => {
    if (!peer) return;

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
      }
    };
  }, [peer]);

  const handleConnect = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    setLocalOffer(JSON.stringify(offer));
  };

  const handleSetRemoteDescription = async () => {
    try {
      const parsed = JSON.parse(remoteDescription);
      await peer.setRemoteDescription(new RTCSessionDescription(parsed));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const localVideo = document.getElementById('localVideo');
      localVideo.srcObject = stream;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      setLocalAnswer(JSON.stringify(answer));
    } catch (err) {
      console.error('Error setting remote offer:', err);
    }
  };

  const handleSetAnswer = async () => {
    try {
      const answerDesc = new RTCSessionDescription(JSON.parse(remoteAnswer));
      await peer.setRemoteDescription(answerDesc);
      console.log('Remote answer set successfully');
    } catch (err) {
      console.error('Error setting remote answer:', err);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      alert('Failed to copy');
    }
  };

  return (
    <div>
      <h1>WebRTC React</h1>
      <button onClick={handleConnect}>Create Offer</button>
      <br />
      <video id="localVideo" autoPlay playsInline style={{ width: '300px' }} />
      <video id="remoteVideo" autoPlay playsInline style={{ width: '300px' }} />
      <br />

      {/* Local Offer */}
      {localOffer && (
        <div>
          <textarea
            readOnly
            value={localOffer}
            style={{ width: '600px', height: '100px' }}
          />
          <br />
          <button onClick={() => copyToClipboard(localOffer)}>Copy Offer</button>
        </div>
      )}

      {/* Remote Description Input */}
      <textarea
        placeholder="Paste Offer here"
        value={remoteDescription}
        onChange={(e) => setRemoteDescription(e.target.value)}
        style={{ width: '600px', height: '100px' }}
      />
      <br />
      <button onClick={handleSetRemoteDescription}>Set Remote Offer & Create Answer</button>
      <br /><br />

      {/* Local Answer */}
      {localAnswer && (
        <div>
          <textarea
            readOnly
            value={localAnswer}
            style={{ width: '600px', height: '100px' }}
          />
          <br />
          <button onClick={() => copyToClipboard(localAnswer)}>Copy Answer</button>
        </div>
      )}

      {/* Remote Answer Input */}
      <textarea
        placeholder="Paste Answer here"
        value={remoteAnswer}
        onChange={(e) => setRemoteAnswer(e.target.value)}
        style={{ width: '600px', height: '100px' }}
      />
      <br />
      <button onClick={handleSetAnswer}>Set Remote Answer</button>
    </div>
  );
};

export default Zoom;
