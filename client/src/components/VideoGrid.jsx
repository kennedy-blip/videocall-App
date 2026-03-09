import React, { useState, useContext, useEffect, useRef } from 'react';
import { RoomContext } from '../context/RoomContext';
import ChatBox from './ChatBox';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, 
  PhoneOff, MessageSquare, ShieldCheck 
} from 'lucide-react';

// Custom hook for volume detection used within the tiles
const useAudioDetection = (stream) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    useEffect(() => {
        if (!stream || !stream.getAudioTracks().length) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const check = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
            setIsSpeaking(avg > 35);
            requestAnimationFrame(check);
        };
        check();
        return () => audioContext.close();
    }, [stream]);
    return isSpeaking;
};

const VideoTile = ({ peer, label }) => {
    const ref = useRef();
    const [remoteStream, setRemoteStream] = useState(null);
    const isSpeaking = useAudioDetection(remoteStream);

    useEffect(() => {
        peer.on("stream", (stream) => {
            ref.current.srcObject = stream;
            setRemoteStream(stream);
        });
    }, [peer]);

    return (
        <div className={`relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border-2 transition-all duration-300 ${isSpeaking ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-zinc-800'}`}>
            <video playsInline autoPlay ref={ref} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium border border-white/10 flex items-center gap-2">
                {label}
            </div>
        </div>
    );
};

const VideoGrid = ({ roomId, userName }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { 
        stream, peers, userVideo, 
        toggleAudio, toggleVideo, isMuted, isCameraOff 
    } = useContext(RoomContext);
    
    const isUserSpeaking = useAudioDetection(stream);

    return (
        <div className="h-screen bg-zinc-950 flex overflow-hidden font-sans text-white">
            {/* Main Video Area */}
            <div className="flex-grow flex flex-col relative">
                {/* Header Info */}
                <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />
                        <span className="text-xs font-bold tracking-tight uppercase">Room: {roomId}</span>
                    </div>
                </div>

                {/* The Grid */}
                <div className={`flex-grow p-6 grid gap-6 items-center justify-center transition-all duration-500 ${
                    peers.length === 0 ? 'grid-cols-1 max-w-4xl mx-auto' : 
                    peers.length === 1 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
                }`}>
                    {/* User's Local Video */}
                    <div className={`relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border-2 transition-all duration-300 ${isUserSpeaking ? 'border-green-500 shadow-lg shadow-green-500/20 scale-[1.02]' : 'border-zinc-800'}`}>
                        <video muted playsInline autoPlay ref={userVideo} className="w-full h-full object-cover scale-x-[-1]" />
                        {isCameraOff && (
                            <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center">
                                <div className="p-4 bg-zinc-800 rounded-full mb-2"><VideoOff size={32} className="text-zinc-600"/></div>
                                <span className="text-sm text-zinc-500 font-bold">Camera Off</span>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold border border-white/10">
                            You {isMuted && <span className="ml-1 text-red-500">(Muted)</span>}
                        </div>
                    </div>

                    {/* Remote Peers */}
                    {peers.map((p) => (
                        <VideoTile key={p.peerID} peer={p.peer} label="Guest" />
                    ))}
                </div>

                {/* Control Bar */}
                <div className="h-28 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
                    <button onClick={toggleAudio} className={`p-4 rounded-2xl transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </button>
                    <button onClick={toggleVideo} className={`p-4 rounded-2xl transition-all active:scale-90 ${isCameraOff ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                        {isCameraOff ? <VideoOff /> : <VideoIcon />}
                    </button>
                    <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-4 rounded-2xl transition-all active:scale-90 ${isChatOpen ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                        <MessageSquare />
                    </button>
                    <button onClick={() => window.location.reload()} className="p-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white transition-all active:scale-90 shadow-xl shadow-red-900/20">
                        <PhoneOff />
                    </button>
                </div>
            </div>

            {/* Side Chat */}
            {isChatOpen && (
                <ChatBox 
                    roomId={roomId} 
                    userName={userName} 
                    onClose={() => setIsChatOpen(false)} 
                />
            )}
        </div>
    );
};

export default VideoGrid;