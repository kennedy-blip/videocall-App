/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

export const RoomContext = createContext();

// Ensure your Node server is running on this port
const socket = io('http://localhost:5000', {
    transports: ['websocket'], // Forces websocket for better stability
});

export const RoomProvider = ({ children }) => {
    const [stream, setStream] = useState(null);
    const [peers, setPeers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);

    const userVideo = useRef();
    const peersRef = useRef([]); // Keeps track of active Peer objects
    const socketRef = useRef(socket);

    const joinRoom = (roomId, userName) => {
        // 1. Setup Camera and Mic
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                }

                // 2. Emit Join Event
                socketRef.current.emit('join-room', { roomId, userName });

                // 3. Listen for existing users
                socketRef.current.on('all-users', (users) => {
                    const peersList = [];
                    users.forEach((userID) => {
                        const peer = createPeer(userID, socketRef.current.id, currentStream);
                        peersRef.current.push({ peerID: userID, peer });
                        peersList.push({ peerID: userID, peer });
                    });
                    setPeers(peersList);
                });

                // 4. Listen for someone new joining
                socketRef.current.on('user-joined', (payload) => {
                    const peer = addPeer(payload.signal, payload.callerID, currentStream);
                    peersRef.current.push({ peerID: payload.callerID, peer });
                    setPeers((prev) => [...prev, { peerID: payload.callerID, peer }]);
                });

                // 5. Complete Handshake
                socketRef.current.on('receiving-returned-signal', (payload) => {
                    const item = peersRef.current.find((p) => p.peerID === payload.id);
                    if (item) item.peer.signal(payload.signal);
                });

                // 6. CHAT LISTENER: This handles receiving messages
                socketRef.current.on('receive-message', (data) => {
                    setMessages((prev) => [...prev, data]);
                });

                // 7. Cleanup
                socketRef.current.on('user-left', (id) => {
                    const peerObj = peersRef.current.find((p) => p.peerID === id);
                    if (peerObj) peerObj.peer.destroy();
                    const updatedPeers = peersRef.current.filter((p) => p.peerID !== id);
                    peersRef.current = updatedPeers;
                    setPeers(updatedPeers);
                });
            })
            .catch((err) => console.error("Access Denied:", err));
    };

    const sendMessage = (roomId, text, userName) => {
        if (text.trim() && socketRef.current) {
            // Emitting the message to the server
            socketRef.current.emit('send-message', {
                roomId,
                message: text,
                userName,
            });
        }
    };

    // WebRTC Peer Helpers
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on('signal', (signal) => {
            socketRef.current.emit('sending-signal', { userToSignal, callerID, signal });
        });
        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', (signal) => {
            socketRef.current.emit('returning-signal', { signal, callerID });
        });
        peer.signal(incomingSignal);
        return peer;
    }

    // Media Toggle Logic
    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsCameraOff(!stream.getVideoTracks()[0].enabled);
        }
    };

    return (
        <RoomContext.Provider value={{
            stream, peers, userVideo, joinRoom,
            messages, sendMessage, toggleAudio, toggleVideo,
            isMuted, isCameraOff
        }}>
            {children}
        </RoomContext.Provider>
    );
};