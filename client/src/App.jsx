import React, { useState, useContext } from 'react';
import LandingPage from './components/LandingPage';
import VideoGrid from './components/VideoGrid';
import { RoomContext } from './context/RoomContext';

function App() {
  const [roomConfig, setRoomConfig] = useState({ joined: false, roomId: '', userName: '' });
  const { joinRoom } = useContext(RoomContext);

  const handleJoin = (roomId, userName) => {
    // 1. Initialize the WebRTC logic
    joinRoom(roomId, userName);
    
    // 2. Switch the UI view
    setRoomConfig({
      joined: true,
      roomId: roomId,
      userName: userName
    });
  };

  return (
    <main className="min-h-screen bg-zinc-950 selection:bg-blue-500/30">
      {!roomConfig.joined ? (
        <LandingPage onJoin={handleJoin} />
      ) : (
        <VideoGrid 
            roomId={roomConfig.roomId} 
            userName={roomConfig.userName} 
        />
      )}
    </main>
  );
}

export default App;