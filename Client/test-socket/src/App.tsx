import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const App = () => {
  const [username, setUsername] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [messages, setMessages] = useState<Array<any>>([]);


  const handleConnect = () => {

    const userName = prompt('Enter your name') || 'Anonymous';
    if (!userName) {
      alert('Please enter a valid name');
      return;
    }

    const roomName = prompt('Enter room name') || 'default';
    if (!roomName) {
      alert('Please enter a valid room name');
      return;
    }

    setUsername(userName);

    setRoom(roomName);

    socket.emit('join room', { username: userName, room: roomName });
  };

  const sendMessage = () => {
    if (!text) {
      return;
    }
    socket.emit('send message', {
      username,
      text,
      room,
    });
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        username,
        text,
        timestamp: new Date(),
      },
    ]);
    setText('');
  };

  useEffect(() => {
    socket.on('users', (users) => {
      console.log(users);
    });

    socket.on('message', (message) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('new message', (message) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('user disconnected', (payload) => {
      console.log(payload);
    });

    return () => {
      socket.off('users');
      socket.off('message');
      socket.off('new message');
      socket.off('user disconnected');
    };
  }, []);

  return (
    <div>
      <h1>Welcome, {username}!</h1>

      <div>
        <h2>Join Room</h2>
        <button onClick={handleConnect}>Join Room</button>
      </div>

      <div>
        <h2>Write a message:</h2>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." />
        <button onClick={sendMessage}>Send Message</button>
      </div>

      <div style={{ width: '50%', height: '300px', overflow: 'auto', border: '1px solid black', padding: '10px' }}>
        {messages.map((message: any, index: number) => (
          <div key={index}>
            <p style={{ fontWeight: 'bold', color: 'darkblue', margin: '0 0 10px 0' }}>{message.username}</p>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default App;
