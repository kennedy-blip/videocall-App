import React, { useState } from 'react';
import { Video, PlusCircle, ArrowRight } from 'lucide-react';

const LandingPage = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return alert("Please enter your name first!");
    // Calling the Node.js backend to get a unique UUID
    const response = await fetch('http://localhost:5000/create-room');
    const data = await response.json();
    onJoin(data.roomId, name);
  };

  const handleJoinExisting = () => {
    if (!name.trim() || !roomId.trim()) return alert("Name and Room ID are required!");
    onJoin(roomId, name);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-zinc-800 transform transition-all hover:scale-[1.01]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Video size={28} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Morallive</h1>
        </div>
        
        <label className="text-sm text-zinc-400 mb-2 block ml-1">Your Display Name</label>
        <input 
          className="w-full p-4 bg-zinc-800 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 transition-all"
          placeholder="e.g. Kennedy"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button 
          onClick={handleCreate}
          className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-8 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <PlusCircle size={20} /> Create New Meeting
        </button>

        <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="mx-4 text-zinc-600 text-xs font-bold uppercase tracking-widest">or join with code</span>
            <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="flex gap-3">
          <input 
            className="flex-grow p-4 bg-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 transition-all uppercase placeholder:normal-case"
            placeholder="Room Code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button 
            onClick={handleJoinExisting}
            className="bg-zinc-700 hover:bg-zinc-600 p-4 rounded-xl transition-all active:scale-90"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
      <p className="mt-8 text-zinc-500 text-sm italic">Max capacity: 6 participants</p>
    </div>
  );
};

export default LandingPage;