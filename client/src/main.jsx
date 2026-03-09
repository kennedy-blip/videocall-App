import { Buffer } from 'buffer';
import EventEmitter from 'events';

window.Buffer = Buffer;
window.EventEmitter = EventEmitter;
window.global = window;
window.process = { env: { NODE_ENV: 'development' }, nextTick: (fn) => setTimeout(fn, 0) };

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RoomProvider } from './context/RoomContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoomProvider>
      <App />
    </RoomProvider>
  </React.StrictMode>
);