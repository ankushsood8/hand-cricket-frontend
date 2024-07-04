import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ParticlesComponent from './particles';
import './App.css';
import SelectMode from './SelectMode';
import CreateOrJoinRoom from './CreateOrJoinRoom';
import CreateRoom from './CreateRoom';
import HomePage from './HomePage';


const socket = io('localhost:5000/')
function App() {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [playMatch, setPlayMatch] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [activeRooms, setActiveRooms] = useState([{}]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSelectMode, setSelectedMode] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  
  const setUser = () => {
    setUserRegistered(true);
  }

  const createRoom = () => {
    socket.emit('create room', userName);
    setRoomCreated(true);
  }

  const joinRoom = () => {
    socket.emit('join room', userName, joinRoomId);
  }

  const playerMove = (move) => {
    socket.emit('player move', roomId, move);
    setIsDisabled(true);
  }
  
  const modeSelected = (mode) => {
    setSelectedMode(true);
    if (mode === 'singleplayer') {
      socket.emit('play with cpu', userName);
    }
  }
  
  const handleChange = (event) => {
    setUserName(event.target.value);
  };
  
  const handleChangeRoomId = (event) => {
    setJoinRoomId(event.target.value);
  }

  useEffect(() => {
    socket.on('room created', (roomId) => {
      setRoomId(roomId);
    });

    socket.on('room not found', () => {
      alert('Room not found');
    });

    socket.on('room full', () => {
      alert('Room is full only 2 users allowed');
    });

    socket.on('can play now', (roomId, activeRooms) => {
      setPlayMatch(true);
      setRoomId(roomId);
      setActiveRooms(activeRooms);
    });

    socket.on('score updated', (activeRooms) => {
      setActiveRooms(activeRooms);
      setIsDisabled(false);
    })

    socket.on('bowled out', (batting, bowling, activeRooms, batterScore) => {
      alert(`${batting} scored ${batterScore} and is Bowled Out.  ${bowling} will bat now`);
      setIsDisabled(false);
      setActiveRooms(activeRooms);
    })
    
    socket.on('user2 won match', (winner, roomId) => {
      let playOneMoreMatch = window.confirm(`${winner} won the match Do you want to play one more match?`);
      if (playOneMoreMatch) {
        socket.emit('play again', roomId);
      }
      else {
        setUserName('');
        setUserRegistered(false);
        setPlayMatch(false);
        setRoomCreated(false);
        setActiveRooms([]);
        setIsDisabled(false);
      }
    })
    
    socket.on('restartMatch', (activeRooms) => {
      setActiveRooms(activeRooms);
      setIsDisabled(false);
    })

    socket.on('out', (winner, draw, activeRooms, roomId) => {
      setActiveRooms(activeRooms);
      let playOneMoreMatch;
      if (draw) {
        playOneMoreMatch = window.confirm('Match Draw Do You want to play one more match?');
      }
      else {
        playOneMoreMatch = window.confirm(`${winner} won the match Do You want to play one more match?`);
      }
      if (playOneMoreMatch) {
        socket.emit('play again', roomId);
      }
      else {
        setUserName('');
        setUserRegistered(false);
        setPlayMatch(false);
        setRoomCreated(false);
        setActiveRooms([]);
        setIsDisabled(false);
      }
    })

  }, []);
  return (
    <>
      <ParticlesComponent id='particles'></ParticlesComponent>
      {!userRegistered && !roomCreated &&
       <HomePage handleChange={handleChange} setUser={setUser}></HomePage>
      }
      
      {
        userRegistered && !isSelectMode &&
        <SelectMode modeSelected={modeSelected}></SelectMode>
      }
       
      {
        roomCreated && !playMatch && userRegistered && isSelectMode &&
        <CreateRoom roomId={roomId}></CreateRoom>
      }
      

      {!playMatch && userRegistered && !roomCreated && isSelectMode &&
       <CreateOrJoinRoom createRoom={createRoom} joinRoom={joinRoom} handleChangeRoomId= {handleChangeRoomId}></CreateOrJoinRoom>
      }
      {playMatch &&
        <>
          <h1 className='text-center mt-4'>{activeRooms[roomId]?.users[0].userName} vs {activeRooms[roomId]?.users[1].userName}</h1>
          <div className='d-flex justify-content-between p-4'>
            <h3>Batting By {activeRooms[roomId]?.users[0].userName}</h3>
            <h3>Bowling By {activeRooms[roomId]?.users[1].userName}</h3>
          </div>
          <h1 className='text-center'>Batting Score - {activeRooms[roomId]?.totalScore}</h1>
          <div className='h-50 d-flex justify-content-center align-items-center p-2'>
            <button onClick={()=>playerMove('1')} className={`btn btn-primary ${isDisabled ? 'disabled' : ''}`}>1</button>
            <button onClick={()=>playerMove('2')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>2</button>
            <button onClick={()=>playerMove('3')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>3</button>
            <button onClick={()=>playerMove('4')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>4</button>
            <button onClick={()=>playerMove('5')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>5</button>
            <button onClick={()=>playerMove('6')} className={`btn btn-primary ms-2 ${isDisabled ? 'disabled' : ''}`}>6</button>
          </div>
        </>}
    </>
  );
}

export default App;
