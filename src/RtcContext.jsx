import React from "react";

export const RtcContext = React.createContext();
const RtcStun = 'stun:stun.l.google.com:19302';
const config = {
    iceServers:[
        {urls: RtcStun}
    ]
}
const peer =new RTCPeerConnection(config);
const RtcContextProvider = ({ children }) => {
    return <RtcContext.Provider value={{ peer }}>
        {children}
    </RtcContext.Provider>
}
export default RtcContextProvider;