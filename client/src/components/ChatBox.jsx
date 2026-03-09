import React, { useState, useContext, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { RoomContext } from '../context/RoomContext';

const ChatBox = ({ roomId, userName, onClose }) => {
    // 1. Hooking into our updated RoomContext
    const { messages, sendMessage } = useContext(RoomContext);
    const [input, setInput] = useState('');
    const scrollRef = useRef();

    // 2. Auto-scroll to bottom whenever a new message arrives
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        if (e) e.preventDefault();
        
        if (input.trim()) {
            // Calling the context function we just updated
            sendMessage(roomId, input, userName);
            setInput('');
        }
    };

    return (
        <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-blue-500" />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">In-Call Messages</h3>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
                    <X size={20}/>
                </button>
            </div>

            {/* Message List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center px-4">
                        <MessageCircle size={40} className="mb-2 opacity-20" />
                        <p className="text-xs italic">Messages are only visible to people in the call and are deleted when the call ends.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.sender === userName ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-zinc-500 mb-1 px-1">
                                {msg.sender === userName ? 'You' : msg.sender} • {msg.time}
                            </span>
                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm break-words shadow-sm ${
                                msg.sender === userName 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="relative group">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Send a message..."
                        className="w-full bg-zinc-800 text-white text-sm p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 transition-all placeholder:text-zinc-600"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="absolute right-2 top-1.5 text-blue-500 p-2 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;